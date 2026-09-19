import { toDisplayCountyName } from '../utils/countyNames.js'

const REGION_DATA_URL = '/geo/taiwan-districts-overview.topo.json'
let regionsPromise

export const COLLECTION_COUNTY_ORDER = [
  '台北市', '新北市', '基隆市',
  '桃園市', '新竹縣', '新竹市', '苗栗縣',
  '台中市', '彰化縣', '南投縣',
  '雲林縣', '嘉義縣', '嘉義市', '台南市',
  '高雄市', '屏東縣',
  '宜蘭縣', '花蓮縣', '台東縣',
  '澎湖縣', '金門縣', '連江縣',
]

export function groupAdministrativeRegions(topology) {
  const geometries = Object.values(topology?.objects ?? {})[0]?.geometries
  if (!Array.isArray(geometries)) throw new Error('行政區資料格式錯誤')
  const districtsByCounty = new Map()
  geometries.forEach(({ properties = {} }) => {
    if (!properties.COUNTYNAME || !properties.TOWNNAME || !properties.TOWNCODE) return
    const countyName = toDisplayCountyName(properties.COUNTYNAME)
    const districts = districtsByCounty.get(countyName) ?? []
    districts.push({ id: properties.TOWNCODE, name: properties.TOWNNAME, englishName: properties.TOWNENG ?? '' })
    districtsByCounty.set(countyName, districts)
  })
  const countyOrder = new Map(COLLECTION_COUNTY_ORDER.map((name, index) => [name, index]))
  return [...districtsByCounty].map(([name, districts]) => ({
    name,
    districts: districts.sort((left, right) => left.id.localeCompare(right.id)),
  })).sort((left, right) => (countyOrder.get(left.name) ?? 999) - (countyOrder.get(right.name) ?? 999))
}

export function loadAdministrativeRegions(signal) {
  regionsPromise ??= fetch(REGION_DATA_URL)
    .then(response => {
      if (!response.ok) throw new Error(`行政區資料載入失敗（${response.status}）`)
      return response.json()
    })
    .then(groupAdministrativeRegions)
    .catch(error => { regionsPromise = undefined; throw error })
  if (!signal) return regionsPromise
  return Promise.race([
    regionsPromise,
    new Promise((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })),
  ])
}
