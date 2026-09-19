import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTimeline } from './journalTimeline.js'

test('builds a chronological timeline from object-based mission completions', () => {
  const timeline = buildTimeline({
    missionCompletions: {
      photo: { completedAt: '2026-09-19T00:02:00Z', evidence: { mediaId: 'photo-1' } },
      stamp: { completedAt: '2026-09-19T00:01:00Z', evidence: {} },
    },
    photoRecords: [], stampRecords: [],
  })
  assert.deepEqual(timeline.map(item => item.taskId), ['stamp', 'photo'])
  assert.equal(timeline[1].mediaId, 'photo-1')
})
