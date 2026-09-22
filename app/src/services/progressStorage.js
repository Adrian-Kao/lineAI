import { DEMO_CONTENT_VERSION, TASKS } from '../data/temple.js'
export function makeProgressKey(userId) {
  if (!userId) throw new Error('缺少使用者 ID')
  return `wanchun-demo:v1:${userId}`
}

function isWanchunStamp(record) {
  return record?.templeId === 'wanchun' || record?.taskId === 'stamp'
}

// 將早期「第一關即取得印章」的資料修正為完成萬春宮三關後才取得。
export function normalizeProgress(snapshot) {
  let normalized = snapshot
  const itineraryItems = Array.isArray(snapshot?.itineraryItems) ? snapshot.itineraryItems : []
  if (itineraryItems !== snapshot?.itineraryItems) normalized = { ...normalized, itineraryItems }
  const completedDistrictIds = Array.isArray(snapshot?.completedDistrictIds) ? snapshot.completedDistrictIds : []
  if (completedDistrictIds !== snapshot?.completedDistrictIds) normalized = { ...normalized, completedDistrictIds }
  const completedCountyIds = Array.isArray(snapshot?.completedCountyIds) ? snapshot.completedCountyIds : []
  if (completedCountyIds !== snapshot?.completedCountyIds) normalized = { ...normalized, completedCountyIds }
  const taiwanCompleted = snapshot?.taiwanCompleted === true
  if (taiwanCompleted !== snapshot?.taiwanCompleted) normalized = { ...normalized, taiwanCompleted }
  const linePoints = Number.isFinite(snapshot?.linePoints) && snapshot.linePoints >= 0 ? snapshot.linePoints : 0
  if (linePoints !== snapshot?.linePoints) normalized = { ...normalized, linePoints }
  const stampRecords = Array.isArray(snapshot?.stampRecords) ? snapshot.stampRecords : []
  const templeComplete = TASKS.every(task => snapshot?.missionCompletions?.[task.id])
  const completedAt = snapshot?.missionCompletions?.[TASKS.at(-1).id]?.completedAt
  const existingWanchunStamps = stampRecords.filter(isWanchunStamp)
  const correctWanchunStamp = existingWanchunStamps.length === 1 &&
    existingWanchunStamps[0].templeId === 'wanchun' &&
    existingWanchunStamps[0].acquiredAt === completedAt
  if ((!templeComplete && existingWanchunStamps.length) || (templeComplete && !correctWanchunStamp)) {
    normalized = {
      ...normalized,
      stampRecords: [
        ...stampRecords.filter(record => !isWanchunStamp(record)),
        ...(templeComplete ? [{ templeId: 'wanchun', acquiredAt: completedAt }] : []),
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
export function clearProgress(userId, storage = globalThis.localStorage) { storage?.removeItem(makeProgressKey(userId)) }
