import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState, gameReducer } from '../state/gameReducer.js'
import { applyCentralDemoCompletion, isCentralDistrictComplete, isTempleComplete } from '../state/gameRules.js'

function complete(state, taskId, minute) {
  return gameReducer(state, {
    type: 'TASK_COMPLETED',
    payload: {
      taskId,
      completedAt: `2026-09-23T00:0${minute}:00.000Z`,
      evidence: taskId === 'photo' ? { kind: 'photo', mediaId: 'reference-photo' } : { kind: taskId },
    },
  })
}

test('unlocks the temple memorial stamp only after all three missions', () => {
  let state = createInitialState()
  state = complete(state, 'stamp', 0)
  assert.equal(state.stampRecords.length, 0)
  state = complete(state, 'photo', 1)
  assert.equal(state.stampRecords.length, 0)
  state = complete(state, 'puzzle', 2)
  assert.deepEqual(state.stampRecords, [
    { templeId: 'wanchun', acquiredAt: '2026-09-23T00:02:00.000Z' },
  ])
})

test('does not treat completing Wanchun Temple as completing Central District', () => {
  let state = createInitialState()
  state = complete(complete(state, 'stamp', 0), 'photo', 1)
  assert.equal(isCentralDistrictComplete(state), false)
  state = complete(state, 'puzzle', 2)
  assert.equal(isCentralDistrictComplete(state), false)
  assert.equal(isCentralDistrictComplete({ ...state, completedDistrictIds: ['66000010'] }), true)
})

test('central district demo marks every Wanchun mission complete without changing stored progress', () => {
  const state = createInitialState()
  const displayState = applyCentralDemoCompletion(state, true)
  assert.equal(isTempleComplete(displayState), true)
  assert.deepEqual(state.missionCompletions, {})
})
