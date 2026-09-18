import { DEMO_CONTENT_VERSION } from '../data/temple.js'
export function makeProgressKey(userId) {
  if (!userId) throw new Error('缺少使用者 ID')
  return `wanchun-demo:v1:${userId}`
}
export function loadProgress(userId) {
  const raw = localStorage.getItem(makeProgressKey(userId))
  if (!raw) return null
  const snapshot = JSON.parse(raw)
  if (snapshot.schemaVersion !== 1 || snapshot.contentVersion !== DEMO_CONTENT_VERSION || !snapshot.missionCompletions || !Array.isArray(snapshot.stampRecords) || !Array.isArray(snapshot.photoRecords) || !Array.isArray(snapshot.journalEvents)) throw new Error('進度資料格式或版本不相容')
  return snapshot
}
export function saveProgress(userId, snapshot) { localStorage.setItem(makeProgressKey(userId), JSON.stringify(snapshot)) }
