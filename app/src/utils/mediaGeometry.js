function positiveNumber(value, label) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be a positive number`)
  return value
}

export function normalizeHoleRect(hole) {
  const normalized = {
    x: Number(hole?.x),
    y: Number(hole?.y),
    width: Number(hole?.width),
    height: Number(hole?.height),
  }
  const values = Object.values(normalized)
  if (values.some(value => !Number.isFinite(value))) throw new Error('Hole coordinates must be finite numbers')
  if (normalized.x < 0 || normalized.y < 0 || normalized.width <= 0 || normalized.height <= 0) throw new Error('Hole coordinates are outside the image')
  if (normalized.x + normalized.width > 1 || normalized.y + normalized.height > 1) throw new Error('Hole coordinates must fit inside the image')
  return normalized
}

export function calculateDisplayedMediaRect({ mediaWidth, mediaHeight, containerWidth, containerHeight, objectFit = 'cover' }) {
  positiveNumber(mediaWidth, 'mediaWidth')
  positiveNumber(mediaHeight, 'mediaHeight')
  positiveNumber(containerWidth, 'containerWidth')
  positiveNumber(containerHeight, 'containerHeight')
  if (objectFit !== 'cover' && objectFit !== 'contain') throw new Error(`Unsupported object-fit: ${objectFit}`)

  const scaleX = containerWidth / mediaWidth
  const scaleY = containerHeight / mediaHeight
  const scale = objectFit === 'cover' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY)
  const width = mediaWidth * scale
  const height = mediaHeight * scale

  return {
    scale,
    width,
    height,
    left: (containerWidth - width) / 2,
    top: (containerHeight - height) / 2,
  }
}

export function mapNormalizedHoleToMedia({ hole, mediaWidth, mediaHeight, containerWidth, containerHeight }) {
  const normalizedHole = normalizeHoleRect(hole)
  const displayed = calculateDisplayedMediaRect({ mediaWidth, mediaHeight, containerWidth, containerHeight })
  const containerRect = {
    x: normalizedHole.x * containerWidth,
    y: normalizedHole.y * containerHeight,
    width: normalizedHole.width * containerWidth,
    height: normalizedHole.height * containerHeight,
  }

  const x = Math.max(0, (containerRect.x - displayed.left) / displayed.scale)
  const y = Math.max(0, (containerRect.y - displayed.top) / displayed.scale)
  const right = Math.min(mediaWidth, (containerRect.x + containerRect.width - displayed.left) / displayed.scale)
  const bottom = Math.min(mediaHeight, (containerRect.y + containerRect.height - displayed.top) / displayed.scale)

  return {
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(0, bottom - y),
    displayed,
  }
}
