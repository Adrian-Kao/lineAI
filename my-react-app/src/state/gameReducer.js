import { DEMO_CONTENT_VERSION } from '../data/temple.js'
export function createInitialState() {
  return { schemaVersion: 1, contentVersion: DEMO_CONTENT_VERSION, missionCompletions: {}, stampRecords: [], photoRecords: [], journalEvents: [] }
}
export function gameReducer(state, action) {
  if (action.type === 'HYDRATE') return action.payload
  // A：加入 TASK_COMPLETED、前置條件及收藏去重。
  return state
}
