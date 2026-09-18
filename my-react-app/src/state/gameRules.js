import { TASKS } from '../data/temple.js'
export function getTask(taskId) { return TASKS.find(task => task.id === taskId) ?? null }
export function getTaskStatus(state, taskId) {
  const task = getTask(taskId)
  if (!task) return 'locked'
  if (state.missionCompletions[taskId]) return 'completed'
  return TASKS.filter(item => item.order < task.order).every(item => state.missionCompletions[item.id]) ? 'available' : 'locked'
}
export function getNextTaskId(state) { return TASKS.find(task => getTaskStatus(state, task.id) === 'available')?.id ?? null }
export function isTempleComplete(state) { return TASKS.every(task => Boolean(state.missionCompletions[task.id])) }
export function selectMapStatus(state) { return isTempleComplete(state) ? 'yellow' : 'dark' }
export function selectJournalEvents(state) { return [...state.journalEvents].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)) }
export function validateTaskResult() { throw new Error('待實作：任務證據驗證') }
