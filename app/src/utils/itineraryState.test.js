import test from 'node:test'
import assert from 'node:assert/strict'
import { WANCHUN_TEMPLE_ID } from '../data/templeContent.js'
import { createInitialState, gameReducer } from '../state/gameReducer.js'
import { isTempleInItinerary, selectItineraryItems, validateItineraryTemple } from '../state/gameRules.js'
import { makeProgressKey } from '../services/progressStorage.js'

const item = { templeId: WANCHUN_TEMPLE_ID, county: '台中市', addedAt: '2026-09-20T12:00:00.000Z' }
const temple = {
  id: WANCHUN_TEMPLE_ID,
  name: '萬春宮',
  type: '寺廟',
  religion: '道教',
  deity: '天上聖母',
  county: '台中市',
  sourceCounty: '臺中市',
  address: '台中市中區成功路212號',
  phone: '',
  longitude: 120.682,
  latitude: 24.142,
  sourceUrl: 'https://example.com',
}

function add(state) {
  return gameReducer(state, { type: 'ADD_ITINERARY_TEMPLE', payload: item })
}

test('adds once, sorts by added time, and removes an itinerary temple', () => {
  const first = add(createInitialState())
  const duplicate = add(first)
  assert.equal(first.itineraryItems.length, 1)
  assert.equal(duplicate, first)
  assert.equal(isTempleInItinerary(first, WANCHUN_TEMPLE_ID), true)
  assert.deepEqual(selectItineraryItems(first), [item])

  const removed = gameReducer(first, { type: 'REMOVE_ITINERARY_TEMPLE', payload: { templeId: WANCHUN_TEMPLE_ID } })
  assert.deepEqual(removed.itineraryItems, [])
})

test('keeps itinerary after early tasks and removes it only when the temple completes', () => {
  let state = add(createInitialState())
  state = gameReducer(state, { type: 'TASK_COMPLETED', payload: { taskId: 'stamp', completedAt: '2026-09-20T12:01:00.000Z', evidence: { kind: 'stamp' } } })
  assert.equal(state.itineraryItems.length, 1)
  state = gameReducer(state, { type: 'TASK_COMPLETED', payload: { taskId: 'photo', completedAt: '2026-09-20T12:02:00.000Z', evidence: { kind: 'photo', mediaId: 'photo' } } })
  assert.equal(state.itineraryItems.length, 1)
  state = gameReducer(state, { type: 'TASK_COMPLETED', payload: { taskId: 'puzzle', completedAt: '2026-09-20T12:03:00.000Z', evidence: { kind: 'puzzle', tileOrder: [0, 1, 2, 3] } } })
  assert.deepEqual(state.itineraryItems, [])
})

test('provider-level validation rejects a completed temple', () => {
  const state = {
    ...createInitialState(),
    missionCompletions: {
      stamp: { completedAt: '2026-09-20T12:01:00.000Z' },
      photo: { completedAt: '2026-09-20T12:02:00.000Z' },
      puzzle: { completedAt: '2026-09-20T12:03:00.000Z' },
    },
  }
  assert.throws(() => validateItineraryTemple(state, temple), /不能加入/)
})

test('progress storage remains namespaced by user', () => {
  assert.notEqual(makeProgressKey('traveler-a'), makeProgressKey('traveler-b'))
})
