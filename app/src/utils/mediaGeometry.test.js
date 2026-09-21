import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateDisplayedMediaRect, mapNormalizedHoleToMedia, normalizeHoleRect } from './mediaGeometry.js'

test('calculateDisplayedMediaRect centers a cover-cropped landscape video', () => {
  const result = calculateDisplayedMediaRect({
    mediaWidth: 1920,
    mediaHeight: 1080,
    containerWidth: 600,
    containerHeight: 400,
  })
  assert.equal(result.height, 400)
  assert.ok(Math.abs(result.width - 711.111) < 0.01)
  assert.ok(Math.abs(result.left + 55.555) < 0.01)
  assert.equal(result.top, 0)
})

test('mapNormalizedHoleToMedia uses the same cover crop as the preview', () => {
  const result = mapNormalizedHoleToMedia({
    hole: { x: 0.36, y: 0.22, width: 0.28, height: 0.25 },
    mediaWidth: 1920,
    mediaHeight: 1080,
    containerWidth: 600,
    containerHeight: 400,
  })
  assert.ok(Math.abs(result.x - 733.2) < 0.2)
  assert.ok(Math.abs(result.y - 237.6) < 0.2)
  assert.ok(Math.abs(result.width - 453.6) < 0.2)
  assert.ok(Math.abs(result.height - 270) < 0.2)
})

test('portrait camera crop remains inside source pixels', () => {
  const result = mapNormalizedHoleToMedia({
    hole: { x: 0.36, y: 0.22, width: 0.28, height: 0.25 },
    mediaWidth: 1080,
    mediaHeight: 1920,
    containerWidth: 600,
    containerHeight: 400,
  })
  assert.ok(result.x >= 0)
  assert.ok(result.y >= 0)
  assert.ok(result.x + result.width <= 1080)
  assert.ok(result.y + result.height <= 1920)
})

test('normalizeHoleRect rejects a hole outside the image', () => {
  assert.throws(() => normalizeHoleRect({ x: 0.9, y: 0.2, width: 0.2, height: 0.2 }), /fit inside/)
})
