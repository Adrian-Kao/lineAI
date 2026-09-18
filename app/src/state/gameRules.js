import { TASKS } from '../data/temple.js'
import { isSolved } from '../features/puzzle/puzzleRules.js'
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
export function validateTaskResult(state, result) {
  const task = getTask(result?.taskId)
  if (!task) throw new Error('未知任務')
  if (getTaskStatus(state, task.id) !== 'available') throw new Error('任務尚未解鎖或已完成')
  if (!result.completedAt || Number.isNaN(Date.parse(result.completedAt))) throw new Error('缺少有效完成時間')
  const evidence = result.evidence
  if (task.id === 'stamp' && (evidence?.kind !== 'stamp' || evidence.mockTouchConfirmed !== true)) throw new Error('尚未確認模擬感應')
  if (task.id === 'photo' && (evidence?.kind !== 'photo' || typeof evidence.mediaId !== 'string' || !evidence.mediaId.trim())) throw new Error('尚未保存照片')
  if (task.id === 'puzzle' && (evidence?.kind !== 'puzzle' || !Array.isArray(evidence.tileOrder) || !isSolved(evidence.tileOrder))) throw new Error('拼圖尚未完成')
  return task
}
