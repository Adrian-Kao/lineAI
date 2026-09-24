import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState } from '../state/gameReducer.js'
import { validateTaskResult } from '../state/gameRules.js'

const readyForMinigame = {
  ...createInitialState(),
  missionCompletions: {
    stamp: { completedAt: '2026-09-21T01:00:00.000Z' },
    photo: { completedAt: '2026-09-21T01:01:00.000Z' },
  },
}

function result(evidence) {
  return { taskId: 'puzzle', completedAt: '2026-09-21T01:02:00.000Z', evidence }
}

test('third mission accepts each selectable minigame result', () => {
  assert.equal(validateTaskResult(readyForMinigame, result({ kind: 'puzzle', tileOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8] })).id, 'puzzle')
  assert.equal(validateTaskResult(readyForMinigame, result({ kind: 'lantern', size: 3, board: Array(9).fill(true) })).id, 'puzzle')
  assert.equal(validateTaskResult(readyForMinigame, result({ kind: 'maze', moves: 24, reachedGoal: true })).id, 'puzzle')
  assert.equal(validateTaskResult(readyForMinigame, result({ kind: 'memory', deck: ['censer', 'censer'], flips: [0, 1] })).id, 'puzzle')
})

test('third mission rejects incomplete selectable minigames', () => {
  assert.throws(() => validateTaskResult(readyForMinigame, result({ kind: 'lantern', size: 3, board: Array(9).fill(false) })), /尚未完成/)
  assert.throws(() => validateTaskResult(readyForMinigame, result({ kind: 'maze', moves: 0, reachedGoal: false })), /尚未完成/)
  assert.throws(() => validateTaskResult(readyForMinigame, result({ kind: 'memory', deck: ['censer', 'censer'], flips: [0] })), /尚未完成/)
})
