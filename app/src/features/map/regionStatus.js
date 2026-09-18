export const REGION_STATUS_COLORS = {
  locked: { fill: [222, 223, 226, 255], line: [69, 73, 78, 255] },
  inProgress: { fill: [255, 239, 173, 255], line: [69, 73, 78, 255] },
  unlocked: { fill: [245, 157, 62, 255], line: [69, 73, 78, 255] },
}

// 手動測色：npm run dev 時將 enabled 改為 true，儲存後首頁即更新。
// locked = 淺灰、inProgress = 淺黃、unlocked = 橘色。
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
  enabled: true,
  counties: {},
  districts: {
    '65000210': 'unlocked',     // 台中市中區
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
setCountyColorPreview('66000', 'inProgress', true) // 台中市全部淺黃
setCountyColorPreview('63000', 'inProgress', true)   // 台北市全部橘色
setCountyColorPreview('10014', 'unlocked', true) // 台東市全部橘色
setCountyColorPreview('10016', 'unlocked', true) // 澎湖市全部橘色

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

export function getRegionStatus(regionProgress, districtId) {
  const status = regionProgress[districtId]
  return Object.hasOwn(REGION_STATUS_COLORS, status) ? status : 'locked'
}
