import { DEMO_CONTENT_VERSION, TASKS } from '../data/temple.js'
import { WANCHUN_TEMPLE_ID } from '../data/templeContent.js'
import { makeTempleKey } from '../utils/templeKey.js'
export function createInitialState() {
  return { schemaVersion: 1, contentVersion: DEMO_CONTENT_VERSION, missionCompletions: {}, stampRecords: [], photoRecords: [], journalEvents: [], itineraryItems: [] }
}
export function gameReducer(state, action) {
  if (action.type === 'HYDRATE') return action.payload
  if (action.type === 'ADD_ITINERARY_TEMPLE') {
    const item = action.payload
    const key = makeTempleKey(item)
    if (!key || typeof item?.county !== 'string' || typeof item?.addedAt !== 'string') return state
    const completed = (state.completedTempleIds ?? []).some(id => makeTempleKey(id) === key) ||
      (key === makeTempleKey(WANCHUN_TEMPLE_ID) && TASKS.every(task => state.missionCompletions[task.id]))
    if (completed || (state.itineraryItems ?? []).some(existing => makeTempleKey(existing) === key)) return state
    return { ...state, itineraryItems: [...(state.itineraryItems ?? []), item] }
  }
  if (action.type === 'REMOVE_ITINERARY_TEMPLE') {
    const key = makeTempleKey(action.payload?.templeId ?? action.payload)
    if (!key || !(state.itineraryItems ?? []).some(item => makeTempleKey(item) === key)) return state
    return { ...state, itineraryItems: state.itineraryItems.filter(item => makeTempleKey(item) !== key) }
  }
  if (action.type === 'TASK_COMPLETED') {
    const { taskId, completedAt, evidence } = action.payload
    if (state.missionCompletions[taskId]) return state
    const event = { id: `task:${taskId}`, taskId, occurredAt: completedAt }
    const missionCompletions = { ...state.missionCompletions, [taskId]: { completedAt, evidence } }
    const itineraryItems = TASKS.every(task => missionCompletions[task.id])
      ? (state.itineraryItems ?? []).filter(item => makeTempleKey(item) !== makeTempleKey(WANCHUN_TEMPLE_ID))
      : (state.itineraryItems ?? [])
    return {
      ...state,
      missionCompletions,
      stampRecords: taskId === 'stamp' ? [...state.stampRecords, { taskId, acquiredAt: completedAt }] : state.stampRecords,
      photoRecords: taskId === 'photo' ? [...state.photoRecords, { taskId, mediaId: evidence.mediaId, acquiredAt: completedAt }] : state.photoRecords,
      journalEvents: [...state.journalEvents, event],
      itineraryItems,
    }
  }
  return state
}
