import test from 'node:test'
import assert from 'node:assert/strict'
import { compareTemplePatch } from '../services/imageSimilarity.js'

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
