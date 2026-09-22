export const WANCHUN_TEMPLE_ID = '51c2c438-6bf2-4d6b-b10f-749ae1e95948'
export const WANCHUN_REFERENCE_IMAGE = '/missions/wanchun/reference-full.jpg'

// Only manually sourced stories and licensed images belong here, keyed by source UUID.
export const templeContentById = {
  [WANCHUN_TEMPLE_ID]: {
    displayName: { 'zh-TW': '萬春宮', en: 'Wanchun Temple' },
    image: WANCHUN_REFERENCE_IMAGE,
    // history / features 可加入 { 'zh-TW': '...', en: '...' }；內容必須附可查證來源。
    contentSources: [],
  },
}

// Activity participation is separate from the public POI dataset.
export const missionEnabledTempleIds = new Set([
  WANCHUN_TEMPLE_ID, // 萬春宮（臺中市中區成功路212號）— DEMO 活動唯一點位
])
