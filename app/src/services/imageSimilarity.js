const environment = import.meta.env ?? {}
const DEFAULT_MODE = environment.VITE_PHOTO_COMPARE_MODE ?? (environment.DEV ? 'mock' : 'disabled')
const REMOTE_ENDPOINT = environment.VITE_PHOTO_COMPARE_ENDPOINT ?? ''

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

  throw new Error('正式影像比對服務尚未啟用')
}
