import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeProgress } from '../services/progressStorage.js'

function oldProgress() {
  return {
    missionCompletions: {
      stamp: { completedAt: '2026-09-19T00:00:00.000Z', evidence: { kind: 'stamp' } },
      photo: { completedAt: '2026-09-19T00:01:00.000Z', evidence: { kind: 'photo', mediaId: 'demo' } },
      puzzle: { completedAt: '2026-09-19T00:02:00.000Z', evidence: { kind: 'puzzle', tileOrder: [0, 1, 2, 3] } },
    },
    stampRecords: [],
    photoRecords: [],
    journalEvents: [],
    itineraryItems: [],
  }
}

test('repairs a completed stamp task that has no stamp-book record', () => {
  const repaired = normalizeProgress(oldProgress())
  assert.deepEqual(repaired.stampRecords, [
    { taskId: 'stamp', acquiredAt: '2026-09-19T00:00:00.000Z' },
  ])
})

test('does not duplicate an existing stamp-book record', () => {
  const progress = oldProgress()
  progress.stampRecords.push({ taskId: 'stamp', acquiredAt: '2026-09-18T00:00:00.000Z' })
  assert.equal(normalizeProgress(progress), progress)
  assert.equal(progress.stampRecords.length, 1)
})

test('adds an empty itinerary to legacy progress without clearing other data', () => {
  const progress = oldProgress()
  delete progress.itineraryItems
  const normalized = normalizeProgress(progress)
  assert.deepEqual(normalized.itineraryItems, [])
  assert.deepEqual(normalized.missionCompletions, progress.missionCompletions)
})
