import test from 'node:test'
import assert from 'node:assert/strict'
import { clearProgress, makeProgressKey, normalizeProgress } from '../services/progressStorage.js'

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

test('adds the Wanchun memorial stamp only after all three missions are complete', () => {
  const repaired = normalizeProgress(oldProgress())
  assert.deepEqual(repaired.stampRecords, [
    { templeId: 'wanchun', acquiredAt: '2026-09-19T00:02:00.000Z' },
  ])
})

test('replaces an early legacy stamp with the temple completion reward', () => {
  const progress = oldProgress()
  progress.stampRecords.push({ taskId: 'stamp', acquiredAt: '2026-09-18T00:00:00.000Z' })
  assert.deepEqual(normalizeProgress(progress).stampRecords, [
    { templeId: 'wanchun', acquiredAt: '2026-09-19T00:02:00.000Z' },
  ])
})

test('removes a Wanchun stamp when the temple is not complete', () => {
  const progress = oldProgress()
  delete progress.missionCompletions.puzzle
  progress.stampRecords.push({ taskId: 'stamp', acquiredAt: '2026-09-19T00:00:00.000Z' })
  assert.deepEqual(normalizeProgress(progress).stampRecords, [])
})

test('adds an empty itinerary to legacy progress without clearing other data', () => {
  const progress = oldProgress()
  delete progress.itineraryItems
  const normalized = normalizeProgress(progress)
  assert.deepEqual(normalized.itineraryItems, [])
  assert.deepEqual(normalized.missionCompletions, progress.missionCompletions)
})

test('clears only the selected account progress key', () => {
  const removed = []
  clearProgress('U123', { removeItem: key => removed.push(key) })
  assert.deepEqual(removed, [makeProgressKey('U123')])
})
