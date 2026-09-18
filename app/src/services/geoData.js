import { getCountyName, loadFeatureCollection } from '../features/map/geoLoader.js'

let countyPromise
let districtPromise
let countyBorderPromise
const districtDetails = new Map()

export function loadCountyBorders() {
  countyBorderPromise ??= loadFeatureCollection('/geo/taiwan-county-borders.geo.json')
    .catch(error => { countyBorderPromise = undefined; throw error })
  return countyBorderPromise
}

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
  districtPromise ??= loadFeatureCollection('/geo/taiwan-districts-overview.topo.json')
    .then(collection => {
      if (collection.features.length !== 368 || !collection.features.every(item => item.properties?.COUNTYNAME && item.properties?.TOWNNAME)) {
        throw new Error('鄉鎮市區邊界資料格式不符')
      }
      return collection
    })
    .catch(error => { districtPromise = undefined; throw error })
  return districtPromise
}

export function loadDistrictBoundary(id) {
  if (!/^\d{8}$/.test(id)) return Promise.reject(new Error('鄉鎮市區代碼無效'))
  if (!districtDetails.has(id)) {
    districtDetails.set(id, loadFeatureCollection(`/geo/districts/${id}.topo.json`)
      .then(collection => {
        const feature = collection.features[0]
        if (collection.features.length !== 1 || feature.properties.TOWNCODE !== id) throw new Error('區界資料不符')
        return feature
      }).catch(error => { districtDetails.delete(id); throw error }))
  }
  return districtDetails.get(id)
}

export function getMainlandBounds(collection, { includePenghu = false } = {}) {
  const bounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
  function include(coordinates, isPenghu = false) {
    if (typeof coordinates?.[0] === 'number') {
      const [longitude, latitude] = coordinates
      if (isPenghu || (longitude >= 119.7 && longitude <= 122.2 && latitude >= 21.7 && latitude <= 25.5)) {
        bounds[0][0] = Math.min(bounds[0][0], latitude)
        bounds[0][1] = Math.min(bounds[0][1], longitude)
        bounds[1][0] = Math.max(bounds[1][0], latitude)
        bounds[1][1] = Math.max(bounds[1][1], longitude)
      }
    } else if (Array.isArray(coordinates)) coordinates.forEach(child => include(child, isPenghu))
  }
  collection.features.forEach(item => include(item.geometry?.coordinates, includePenghu && item.properties?.COUNTYCODE === '10016'))
  return bounds
}
