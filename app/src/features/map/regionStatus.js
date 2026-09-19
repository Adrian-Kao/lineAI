export const REGION_STATUS_COLORS = {
  locked: { fill: [222, 223, 226, 255], line: [69, 73, 78, 255] },
  inProgress: { fill: [207, 234, 200, 255], line: [69, 73, 78, 255] },
  unlocked: { fill: [64, 124, 79, 255], line: [45, 86, 55, 255] },
}

// 手動測色：npm run dev 時將 enabled 改為 true，儲存後首頁即更新。
// locked = 未完成（灰）、inProgress = 單區完成（淺綠）、unlocked = 整縣市完成（深綠）。
// 只覆寫地圖顏色，不修改任務或儲存進度；正式 build 不會啟用。
// 代碼請使用字串，保留金門、連江的開頭 0。
// 縣市代碼：5 碼 COUNTYCODE；鄉鎮市區代碼：8 碼 TOWNCODE。
// 鄉鎮市區代碼 = 5 碼縣市代碼 + 3 碼區域編號，不是地圖排列順序。
// 例：66000 台中市；66000 + 010 = 66000010 中區；
//     66000 + 210 = 66000210 外埔區（66000021 並非有效區碼）。
// 縣市對照：
// 63000 台北市、64000 高雄市、65000 新北市、66000 台中市、
// 67000 台南市、68000 桃園市、10017 基隆市、10018 新竹市、10020 嘉義市、
// 10002 宜蘭縣、10004 新竹縣、10005 苗栗縣、10007 彰化縣、10008 南投縣、
// 10009 雲林縣、10010 嘉義縣、10013 屏東縣、10014 台東縣、10015 花蓮縣、
// 10016 澎湖縣、09020 金門縣、09007 連江縣。
export const MAP_COLOR_PREVIEW = {
  enabled: false,
  counties: {},
  temples: {},
  districts: {
    '65000210': 'unlocked',   // 新北市泰山區
    '66000020': 'inProgress', // 台中市東區
    '66000210': 'inProgress', // 台中市外埔區
    '66000220': 'inProgress', // 台中市大安區
    '66000230': 'inProgress', // 台中市烏日區
    '66000030': 'unlocked',   // 台中市南區
  },
}

// enabled=true 開啟該縣市測色；false 關閉，恢復個別區設定或實際進度。
// 整縣市設定優先於上面的個別鄉鎮市區設定；總開關 enabled 也必須為 true。
export function setCountyColorPreview(countyCode, status, enabled = true) {
  if (typeof countyCode !== 'string' || !/^\d{5}$/.test(countyCode)) throw new Error('縣市代碼請填 5 碼字串')
  if (!Object.hasOwn(REGION_STATUS_COLORS, status)) throw new Error('狀態請填 locked、inProgress 或 unlocked')
  MAP_COLOR_PREVIEW.counties[countyCode] = { status, enabled }
}

// 手動測試區：最後一個參數改 true 即可啟用，改 false 即關閉。
setCountyColorPreview('66000', 'inProgress', false) // 台中市全部完成（將顯示深綠）
setCountyColorPreview('63000', 'inProgress', false) // 台北市全部完成（將顯示深綠）
setCountyColorPreview('10014', 'unlocked', false) // 台東縣全部完成（將顯示深綠）
setCountyColorPreview('10016', 'unlocked', false) // 澎湖縣全部完成（將顯示深綠）

export function applyMapColorPreview(actualProgress, collection) {
  if (!MAP_COLOR_PREVIEW.enabled) return actualProgress
  const result = { ...actualProgress, ...MAP_COLOR_PREVIEW.districts }
  for (const feature of collection?.features ?? []) {
    const { COUNTYCODE, TOWNCODE } = feature.properties
    const county = MAP_COLOR_PREVIEW.counties[COUNTYCODE]
    if (county?.enabled) result[TOWNCODE] = county.status
  }
  return result
}

// 宮廟錨點用資料中的 UUID，不使用 5 碼縣市或 8 碼鄉鎮代碼。
// lit=true 亮黃、false 灰色；enabled=false 取消覆寫，恢復實際完成狀態。
export function setTempleLightPreview(templeId, lit = true, enabled = true) {
  if (typeof templeId !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(templeId)) throw new Error('宮廟 ID 請填資料中的 UUID')
  if (typeof lit !== 'boolean' || typeof enabled !== 'boolean') throw new Error('lit 與 enabled 請填 true 或 false')
  MAP_COLOR_PREVIEW.temples[templeId] = { lit, enabled }
}

// 手動測試區：第三個參數改 true 啟用；第二個參數切換亮黃／灰色。
setTempleLightPreview('51c2c438-6bf2-4d6b-b10f-749ae1e95948', true, true) // 萬春宮亮黃（目前關閉）

export function applyTempleLightPreview(actualCompletedIds) {
  if (!MAP_COLOR_PREVIEW.enabled) return actualCompletedIds
  const result = new Set(actualCompletedIds)
  for (const [id, preview] of Object.entries(MAP_COLOR_PREVIEW.temples)) {
    if (!preview.enabled) continue
    if (preview.lit) result.add(id)
    else result.delete(id)
  }
  return result
}

export function getRegionStatus(regionProgress, districtId) {
  const status = regionProgress[districtId]
  return Object.hasOwn(REGION_STATUS_COLORS, status) ? status : 'locked'
}

const COMPLETED_DISTRICT_STATUSES = new Set(['inProgress', 'unlocked'])

export function deriveRegionProgress(districtProgress, collection) {
  if (!collection?.features?.length) return districtProgress

  const result = { ...districtProgress }
  const counties = new Map()

  for (const feature of collection.features) {
    const { COUNTYCODE, TOWNCODE } = feature.properties
    if (!COUNTYCODE || !TOWNCODE) continue
    const districts = counties.get(COUNTYCODE) ?? []
    districts.push(TOWNCODE)
    counties.set(COUNTYCODE, districts)
  }

  for (const districts of counties.values()) {
    const countyComplete = districts.every(id => COMPLETED_DISTRICT_STATUSES.has(getRegionStatus(districtProgress, id)))
    for (const id of districts) {
      const districtComplete = COMPLETED_DISTRICT_STATUSES.has(getRegionStatus(districtProgress, id))
      result[id] = countyComplete ? 'unlocked' : districtComplete ? 'inProgress' : 'locked'
    }
  }

  return result
}
