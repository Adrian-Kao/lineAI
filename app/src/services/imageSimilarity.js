const environment = import.meta.env ?? {}
const DEFAULT_MODE = environment.VITE_PHOTO_COMPARE_MODE ?? 'local'
const REMOTE_ENDPOINT = environment.VITE_PHOTO_COMPARE_ENDPOINT ?? ''
const SAMPLE_WIDTH = 64
const SAMPLE_HEIGHT = 40

function abortError() {
  return new DOMException('The comparison was aborted', 'AbortError')
}

function wait(ms, signal) {
  if (signal?.aborted) return Promise.reject(abortError())
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, ms)
    function handleAbort() {
      clearTimeout(timer)
      reject(abortError())
    }
    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function correlation(left, right, width, height, shiftX = 0, shiftY = 0) {
  let count = 0
  let leftTotal = 0
  let rightTotal = 0
  let leftSquared = 0
  let rightSquared = 0
  let products = 0

  for (let y = 0; y < height; y += 1) {
    const shiftedY = y + shiftY
    if (shiftedY < 0 || shiftedY >= height) continue
    for (let x = 0; x < width; x += 1) {
      const shiftedX = x + shiftX
      if (shiftedX < 0 || shiftedX >= width) continue
      const leftValue = left[y * width + x]
      const rightValue = right[shiftedY * width + shiftedX]
      count += 1
      leftTotal += leftValue
      rightTotal += rightValue
      leftSquared += leftValue * leftValue
      rightSquared += rightValue * rightValue
      products += leftValue * rightValue
    }
  }

  if (count < width * height * 0.7) return -1
  const numerator = products - (leftTotal * rightTotal) / count
  const leftVariance = leftSquared - (leftTotal * leftTotal) / count
  const rightVariance = rightSquared - (rightTotal * rightTotal) / count
  const denominator = Math.sqrt(Math.max(0, leftVariance) * Math.max(0, rightVariance))
  return denominator > 0.0001 ? numerator / denominator : 0
}

function bestCorrelation(left, right, width, height) {
  let best = -1
  for (let shiftY = -3; shiftY <= 3; shiftY += 1) {
    for (let shiftX = -3; shiftX <= 3; shiftX += 1) {
      best = Math.max(best, correlation(left, right, width, height, shiftX, shiftY))
    }
  }
  return Math.max(0, best)
}

function grayscale(data) {
  const values = new Float32Array(data.length / 4)
  for (let source = 0, target = 0; source < data.length; source += 4, target += 1) {
    values[target] = data[source] * 0.2126 + data[source + 1] * 0.7152 + data[source + 2] * 0.0722
  }
  return values
}

function edges(values, width, height) {
  const result = new Float32Array(values.length)
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x
      const horizontal = values[index + 1] - values[index - 1]
      const vertical = values[index + width] - values[index - width]
      result[index] = Math.hypot(horizontal, vertical)
    }
  }
  return result
}

function colorHistogram(data, bins = 8) {
  const histogram = new Float32Array(bins * 3)
  const binSize = 256 / bins
  const pixelCount = data.length / 4
  for (let index = 0; index < data.length; index += 4) {
    histogram[Math.min(bins - 1, Math.floor(data[index] / binSize))] += 1
    histogram[bins + Math.min(bins - 1, Math.floor(data[index + 1] / binSize))] += 1
    histogram[bins * 2 + Math.min(bins - 1, Math.floor(data[index + 2] / binSize))] += 1
  }
  for (let index = 0; index < histogram.length; index += 1) histogram[index] /= pixelCount
  return histogram
}

function histogramIntersection(left, right) {
  let total = 0
  for (let index = 0; index < left.length; index += 1) total += Math.min(left[index], right[index])
  return clamp01(total / 3)
}

export function calculatePatchSimilarity(capturedPixels, referencePixels, width = SAMPLE_WIDTH, height = SAMPLE_HEIGHT) {
  if (capturedPixels.length !== referencePixels.length || capturedPixels.length !== width * height * 4) throw new Error('影像取樣尺寸不一致')
  const capturedGray = grayscale(capturedPixels)
  const referenceGray = grayscale(referencePixels)
  const structure = bestCorrelation(capturedGray, referenceGray, width, height)
  const edgeStructure = bestCorrelation(edges(capturedGray, width, height), edges(referenceGray, width, height), width, height)
  const color = histogramIntersection(colorHistogram(capturedPixels), colorHistogram(referencePixels))
  return clamp01(structure * 0.58 + edgeStructure * 0.27 + color * 0.15)
}

async function decodeImage(blob) {
  if ('createImageBitmap' in globalThis) return createImageBitmap(blob)
  const url = URL.createObjectURL(blob)
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('無法讀取比對影像'))
      image.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function sampleBlob(blob) {
  const image = await decodeImage(blob)
  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_WIDTH
  canvas.height = SAMPLE_HEIGHT
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('此瀏覽器無法分析相機影像')
  context.drawImage(image, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT)
  const pixels = context.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT).data
  image.close?.()
  return pixels
}

async function compareLocally({ capturedBlob, referencePatchUrl, signal }) {
  const response = await fetch(referencePatchUrl, { signal })
  if (!response.ok) throw new Error('無法載入參考照片缺口')
  const referenceBlob = await response.blob()
  if (signal?.aborted) throw abortError()
  const [capturedPixels, referencePixels] = await Promise.all([sampleBlob(capturedBlob), sampleBlob(referenceBlob)])
  if (signal?.aborted) throw abortError()
  return calculatePatchSimilarity(capturedPixels, referencePixels)
}

export function getImageSimilarityMode() {
  return DEFAULT_MODE
}

export async function compareTemplePatch({ capturedBlob, referencePatchUrl, templeId, threshold, signal, mode = DEFAULT_MODE, mockDelayMs = 650 }) {
  if (!(capturedBlob instanceof Blob)) throw new Error('缺少要比對的相機影像')
  if (!referencePatchUrl || !templeId) throw new Error('拍照關卡設定不完整')
  if (!Number.isFinite(threshold)) throw new Error('拍照關卡缺少相似度門檻')

  if (mode === 'mock') {
    await wait(mockDelayMs, signal)
    // DEMO only: fixed deterministic score. This is not real image recognition.
    const score = 0.86
    return { score, passed: score >= threshold, reason: 'demo-fixed-score', mode: 'mock' }
  }

  if (mode === 'local') {
    const score = await compareLocally({ capturedBlob, referencePatchUrl, signal })
    return { score, passed: score >= threshold, reason: 'local-image-correlation', mode: 'local' }
  }

  if (mode === 'remote') {
    if (!REMOTE_ENDPOINT) throw new Error('尚未設定影像比對服務端點')
    const body = new FormData()
    body.append('capturedPatch', capturedBlob, `${templeId}-capture.jpg`)
    body.append('referencePatchUrl', referencePatchUrl)
    body.append('templeId', templeId)
    body.append('threshold', String(threshold))
    const response = await fetch(REMOTE_ENDPOINT, { method: 'POST', body, signal })
    if (!response.ok) throw new Error(`影像比對服務暫時無法使用（${response.status}）`)
    const result = await response.json()
    const score = Number(result.score)
    if (!Number.isFinite(score)) throw new Error('影像比對服務回傳格式錯誤')
    return { score, passed: typeof result.passed === 'boolean' ? result.passed : score >= threshold, reason: result.reason ?? '', mode: 'remote' }
  }

  throw new Error('影像比對服務尚未啟用')
}
