import { getCountyName, loadFeatureCollection } from '../features/map/geoLoader.js'

let countyPromise
let districtPromise

export function loadCountyBoundaries() {
  countyPromise ??= loadFeatureCollection('/geo/taiwan-counties-20200820.topo.json')
    .then(collection => {
      if (collection.features.length !== 22) throw new Error('縣市邊界數量不符')
      return collection
    })
    .catch(error => { countyPromise = undefined; throw error })
  return countyPromise
}

export function findCountyFeature(collection, county) {
  return collection.features.find(item => getCountyName(item) === county) ?? null
}

export function loadDistrictBoundaries() {
  districtPromise ??= loadFeatureCollection('/geo/taiwan-districts-20230317.topo.json')
    .then(collection => {
      if (collection.features.length !== 368 || !collection.features.every(item => item.properties?.COUNTYNAME && item.properties?.TOWNNAME)) {
        throw new Error('鄉鎮市區邊界資料格式不符')
      }
      return collection
    })
    .catch(error => { districtPromise = undefined; throw error })
  return districtPromise
}

export function getMainlandBounds(collection) {
  const bounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
  function include(coordinates) {
    if (typeof coordinates?.[0] === 'number') {
      const [longitude, latitude] = coordinates
      if (longitude >= 119.7 && longitude <= 122.2 && latitude >= 21.7 && latitude <= 25.5) {
        bounds[0][0] = Math.min(bounds[0][0], latitude)
        bounds[0][1] = Math.min(bounds[0][1], longitude)
        bounds[1][0] = Math.max(bounds[1][0], latitude)
        bounds[1][1] = Math.max(bounds[1][1], longitude)
      }
    } else if (Array.isArray(coordinates)) coordinates.forEach(include)
  }
  collection.features.forEach(item => include(item.geometry?.coordinates))
  return bounds
}
