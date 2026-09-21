import { mapNormalizedHoleToMedia } from './mediaGeometry.js'

function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.9) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('無法建立相機截圖'))
    }, type, quality)
  })
}

function assertVideoReady(video) {
  if (!video?.videoWidth || !video?.videoHeight) throw new Error('相機畫面尚未準備完成')
}

export async function captureHoleRegion({ video, container, hole }) {
  assertVideoReady(video)
  const bounds = container?.getBoundingClientRect?.()
  const containerWidth = container?.clientWidth || bounds?.width
  const containerHeight = container?.clientHeight || bounds?.height
  if (!containerWidth || !containerHeight) throw new Error('找不到參考照片顯示範圍')

  const source = mapNormalizedHoleToMedia({
    hole,
    mediaWidth: video.videoWidth,
    mediaHeight: video.videoHeight,
    containerWidth,
    containerHeight,
  })
  if (!source.width || !source.height) throw new Error('相機裁切範圍無效')

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.width))
  canvas.height = Math.max(1, Math.round(source.height))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('此瀏覽器無法處理相機畫面')
  context.drawImage(video, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height)
  return canvasToBlob(canvas)
}

export async function captureVideoFrame(video, { maxWidth = 1600 } = {}) {
  assertVideoReady(video)
  const scale = Math.min(1, maxWidth / video.videoWidth)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('此瀏覽器無法處理相機畫面')
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvasToBlob(canvas, 'image/jpeg', 0.88)
}
