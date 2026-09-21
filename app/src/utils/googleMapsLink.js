// 產生 Google Maps 路線規劃連結（Maps URLs，手機會直接開 Google Maps App）。
// 優先用座標，資料缺座標時退回地址／名稱文字搜尋。
export function buildDirectionsUrl(temple) {
  const { latitude, longitude, name, address } = temple ?? {}
  const destination = Number.isFinite(latitude) && Number.isFinite(longitude)
    ? `${latitude},${longitude}`
    : [name, address].filter(Boolean).join(' ')
  if (!destination) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}
