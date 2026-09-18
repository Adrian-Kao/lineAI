import { toSourceCountyName } from '../utils/countyNames.js'
import { isPublishedTemple } from '../utils/normalizeTemple.js'

const cache = new Map()
let manifestPromise

async function getManifest() {
  manifestPromise ??= fetch('/data/temples/manifest.json')
    .then(response => {
      if (!response.ok) throw new Error('宮廟資料清單載入失敗')
      return response.json()
    })
    .catch(error => { manifestPromise = undefined; throw error })
  return manifestPromise
}

export async function loadCountyTemples(county, signal) {
  const sourceCounty = toSourceCountyName(county)
  if (!sourceCounty) throw new Error('未知縣市')
  if (cache.has(sourceCounty)) return cache.get(sourceCounty)
  const manifest = await getManifest()
  const entry = manifest.files?.find(file => file.county === sourceCounty)
  if (!entry || entry.status !== 'success') throw new Error(`${county}的宮廟資料尚未成功匯入`)
  const response = await fetch(`/data/temples/${encodeURIComponent(entry.filename)}`, { signal })
  if (!response.ok) throw new Error(`${county}的宮廟資料載入失敗`)
  const data = await response.json()
  if (!Array.isArray(data.temples) || data.county !== sourceCounty) throw new Error('宮廟資料格式錯誤')
  const temples = data.temples.filter(temple => isPublishedTemple(temple) && toSourceCountyName(temple.county) === sourceCounty)
  cache.set(sourceCounty, temples)
  return temples
}

export async function loadTempleById(county, id, signal) {
  const temples = await loadCountyTemples(county, signal)
  return temples.find(temple => temple.id === id) ?? null
}
