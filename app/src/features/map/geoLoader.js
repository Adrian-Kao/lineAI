import { feature as topoFeature } from 'topojson-client'

export function getCountyName(feature) {
  const properties = feature?.properties ?? {}
  const name = properties.COUNTYNAME ?? properties.C_Name ?? properties.name ?? properties.NAME_2 ?? ''
  return String(name).replace(/臺/g, '台')
}

export async function loadFeatureCollection(url, signal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('地圖資料載入失敗')
  const data = await response.json()
  if (data.type === 'FeatureCollection') return data
  if (data.type !== 'Topology') throw new Error('地圖資料格式錯誤')
  const countyObject = data.objects?.['20200820'] ?? data.objects?.['20230317'] ?? data.objects?.counties ?? data.objects?.map
  if (!countyObject) throw new Error('找不到縣市圖層')
  const converted = topoFeature(data, countyObject)
  const features = converted.type === 'FeatureCollection' ? converted.features : [converted]
  if (!features.length) throw new Error('地圖沒有縣市資料')
  return { type: 'FeatureCollection', features }
}

export function getCollectionBounds(collection) {
  const bounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
  function include(coordinates) {
    if (typeof coordinates?.[0] === 'number') {
      bounds[0][0] = Math.min(bounds[0][0], coordinates[0])
      bounds[0][1] = Math.min(bounds[0][1], coordinates[1])
      bounds[1][0] = Math.max(bounds[1][0], coordinates[0])
      bounds[1][1] = Math.max(bounds[1][1], coordinates[1])
    } else if (Array.isArray(coordinates)) coordinates.forEach(include)
  }
  collection.features.forEach(item => include(item.geometry?.coordinates))
  return bounds
}
