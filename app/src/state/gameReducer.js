import { DEMO_CONTENT_VERSION } from '../data/temple.js'
export function createInitialState() {
  return { schemaVersion: 1, contentVersion: DEMO_CONTENT_VERSION, missionCompletions: {}, stampRecords: [], photoRecords: [], journalEvents: [] }
}
export function gameReducer(state, action) {
  if (action.type === 'HYDRATE') return action.payload
  if (action.type === 'TASK_COMPLETED') {
    const { taskId, completedAt, evidence } = action.payload
    if (state.missionCompletions[taskId]) return state
    const event = { id: `task:${taskId}`, taskId, occurredAt: completedAt }
    return {
      ...state,
      missionCompletions: { ...state.missionCompletions, [taskId]: { completedAt, evidence } },
      stampRecords: taskId === 'stamp' ? [...state.stampRecords, { taskId, acquiredAt: completedAt }] : state.stampRecords,
      photoRecords: taskId === 'photo' ? [...state.photoRecords, { taskId, mediaId: evidence.mediaId, acquiredAt: completedAt }] : state.photoRecords,
      journalEvents: [...state.journalEvents, event],
    }
  }
  return state
}
