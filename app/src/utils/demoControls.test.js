import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_DEMO_CONTROLS, DEMO_CONTROLS_STORAGE_KEY, loadDemoControls, normalizeDemoControls, saveDemoControls } from '../services/demoControls.js'

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

test('demo controls only accept known boolean flags', () => {
  assert.deepEqual(normalizeDemoControls({ centralComplete: true, mapColoring: 'true', extra: true }), {
    centralComplete: true, mapColoring: false, limitedEvent: false, rewardNotifications: false,
  })
})

test('demo controls persist independently from account progress', () => {
  const storage = memoryStorage()
  saveDemoControls({ ...DEFAULT_DEMO_CONTROLS, limitedEvent: true }, storage)
  assert.equal(loadDemoControls(storage).limitedEvent, true)
  assert.ok(storage.getItem(DEMO_CONTROLS_STORAGE_KEY))
})
