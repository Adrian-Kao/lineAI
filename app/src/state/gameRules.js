import { TASKS } from '../data/temple.js'
import { WANCHUN_TEMPLE_ID } from '../data/templeContent.js'
import { isSolved as isPuzzleSolved } from '../features/minigames/puzzle/puzzleRules.js'
import { GRID_SIZE, isSolved as isLanternSolved } from '../features/minigames/lantern/lanternRules.js'
import { isMazeSolved } from '../features/minigames/maze/mazeRules.js'
import { isMemorySolved } from '../features/minigames/memory/memoryRules.js'
import { isPublishedTemple } from '../utils/normalizeTemple.js'
import { makeTempleKey } from '../utils/templeKey.js'
export function getTask(taskId) { return TASKS.find(task => task.id === taskId) ?? null }
export function getTaskStatus(state, taskId) {
  const task = getTask(taskId)
  if (!task) return 'locked'
  if (state.missionCompletions[taskId]) return 'completed'
  return TASKS.filter(item => item.order < task.order).every(item => state.missionCompletions[item.id]) ? 'available' : 'locked'
}
export function getNextTaskId(state) { return TASKS.find(task => getTaskStatus(state, task.id) === 'available')?.id ?? null }
export function isTempleComplete(state) { return TASKS.every(task => Boolean(state.missionCompletions[task.id])) }
export function applyCentralDemoCompletion(state, enabled) {
  if (!enabled) return state
  const missionCompletions = { ...state.missionCompletions }
  TASKS.forEach((task, index) => {
    missionCompletions[task.id] ??= {
      completedAt: `2026-09-23T00:0${index}:00.000Z`,
      evidence: { kind: 'demo', centralDistrictComplete: true },
    }
  })
  return { ...state, missionCompletions }
}
export function isTempleCompleted(state, templeId) {
  const key = makeTempleKey(templeId)
  if (!key) return false
  if ((state.completedTempleIds ?? []).some(id => makeTempleKey(id) === key)) return true
  return key === makeTempleKey(WANCHUN_TEMPLE_ID) && isTempleComplete(state)
}
export function isCentralDistrictComplete(state) {
  return (state.completedDistrictIds ?? []).includes('66000010')
}
export function isTempleInItinerary(state, templeId) {
  const key = makeTempleKey(templeId)
  return Boolean(key) && (state.itineraryItems ?? []).some(item => makeTempleKey(item) === key)
}
export function selectItineraryItems(state) {
  return (state.itineraryItems ?? [])
    .filter(item => !isTempleCompleted(state, item.templeId))
    .toSorted((a, b) => a.addedAt.localeCompare(b.addedAt))
}
export function validateItineraryTemple(state, temple) {
  if (!isPublishedTemple(temple)) throw new Error('宮廟資料不完整，暫時無法加入行程')
  if (isTempleCompleted(state, temple.id)) throw new Error('已完成探索的宮廟不能加入待訪行程')
  return {
    templeId: makeTempleKey(temple.id),
    county: temple.county,
  }
}
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
  if (task.id === 'puzzle') {
    const completed = (
      (evidence?.kind === 'puzzle' && isPuzzleSolved(evidence.tileOrder)) ||
      (evidence?.kind === 'lantern' && evidence.size === GRID_SIZE && isLanternSolved(evidence.board, GRID_SIZE)) ||
      (evidence?.kind === 'maze' && isMazeSolved(evidence)) ||
      (evidence?.kind === 'memory' && isMemorySolved(evidence.deck, evidence.flips))
    )
    if (!completed) throw new Error('小遊戲尚未完成')
  }
  return task
}
