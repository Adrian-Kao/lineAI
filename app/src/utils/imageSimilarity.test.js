import test from 'node:test'
import assert from 'node:assert/strict'
import { calculatePatchSimilarity, compareTemplePatch } from '../services/imageSimilarity.js'

const input = {
  capturedBlob: new Blob(['demo'], { type: 'image/jpeg' }),
  referencePatchUrl: '/missions/wanchun/reference-patch.jpg',
  templeId: 'wanchun',
  mode: 'mock',
  mockDelayMs: 0,
}

test('mock similarity result follows the task threshold', async () => {
  const passed = await compareTemplePatch({ ...input, threshold: 0.82 })
  const failed = await compareTemplePatch({ ...input, threshold: 0.9 })
  assert.deepEqual(passed, { score: 0.86, passed: true, reason: 'demo-fixed-score', mode: 'mock' })
  assert.equal(failed.passed, false)
})

test('mock similarity supports AbortController', async () => {
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(
    compareTemplePatch({ ...input, threshold: 0.82, signal: controller.signal }),
    error => error.name === 'AbortError',
  )
})

function createPixels(width, height, valueAt) {
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = valueAt(x, y)
      const index = (y * width + x) * 4
      pixels[index] = value
      pixels[index + 1] = value
      pixels[index + 2] = value
      pixels[index + 3] = 255
    }
  }
  return pixels
}

test('local similarity accepts the same scene sample', () => {
  const pixels = createPixels(12, 8, (x, y) => (x * 17 + y * 11) % 256)
  assert.ok(calculatePatchSimilarity(pixels, pixels, 12, 8) > 0.99)
})

test('local similarity rejects a structurally different scene', () => {
  const horizontal = createPixels(12, 8, x => x * 20)
  const vertical = createPixels(12, 8, (_x, y) => y * 30)
  assert.ok(calculatePatchSimilarity(horizontal, vertical, 12, 8) < 0.4)
})
