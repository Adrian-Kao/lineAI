import { DEMO_CONTENT_VERSION } from '../data/temple.js'
export function makeProgressKey(userId) {
  if (!userId) throw new Error('缺少使用者 ID')
  return `wanchun-demo:v1:${userId}`
}

// 修復早期 DEMO 只寫入 missionCompletions、未同步建立集章紀錄的進度。
export function normalizeProgress(snapshot) {
  let normalized = snapshot
  const itineraryItems = Array.isArray(snapshot?.itineraryItems) ? snapshot.itineraryItems : []
  if (itineraryItems !== snapshot?.itineraryItems) normalized = { ...normalized, itineraryItems }
  const stampCompletion = snapshot?.missionCompletions?.stamp
  const stampRecords = Array.isArray(snapshot?.stampRecords) ? snapshot.stampRecords : []
  if (stampCompletion && !stampRecords.some(record => record.taskId === 'stamp')) {
    normalized = {
      ...normalized,
      stampRecords: [
        ...stampRecords,
        { taskId: 'stamp', acquiredAt: stampCompletion.completedAt },
      ],
    }
  }
  return normalized
}

export function loadProgress(userId) {
  const key = makeProgressKey(userId)
  const raw = localStorage.getItem(key)
  if (!raw) return null
  const snapshot = JSON.parse(raw)
  if (snapshot.schemaVersion !== 1 || snapshot.contentVersion !== DEMO_CONTENT_VERSION || !snapshot.missionCompletions || !Array.isArray(snapshot.stampRecords) || !Array.isArray(snapshot.photoRecords) || !Array.isArray(snapshot.journalEvents)) throw new Error('進度資料格式或版本不相容')
  const normalized = normalizeProgress(snapshot)
  if (normalized !== snapshot) localStorage.setItem(key, JSON.stringify(normalized))
  return normalized
}
export function saveProgress(userId, snapshot) { localStorage.setItem(makeProgressKey(userId), JSON.stringify(snapshot)) }
