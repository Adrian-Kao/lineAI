import { toDisplayCountyName, toSourceCountyName } from './countyNames.js'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function normalizeText(value) {
  return typeof value === 'string' ? value.normalize('NFKC').trim() : ''
}

export function isAllowedTemple(feature) {
  const properties = feature?.properties
  if (!properties || typeof properties !== 'object') return false
  const type = normalizeText(properties['類型'])
  const religion = normalizeText(properties['教別'])
  return type === '寺廟' && (religion === '道教' || religion === '佛教')
}

export function isValidCoordinates(coordinates) {
  return Array.isArray(coordinates) && coordinates.length === 2 &&
    coordinates.every(Number.isFinite) &&
    coordinates[0] >= 114 && coordinates[0] <= 124 &&
    coordinates[1] >= 10 && coordinates[1] <= 27
}

export function normalizeTemple(feature, sourceCounty, sourceUrl) {
  const properties = feature?.properties ?? {}
  if (feature?.geometry?.type !== 'Point') return { error: 'invalidGeometry' }
  if (!isValidCoordinates(feature.geometry.coordinates)) return { error: 'invalidCoordinates' }
  const id = normalizeText(properties.uuid)
  const name = normalizeText(properties['名稱'])
  if (!uuidPattern.test(id)) return { error: 'invalidUuid' }
  if (!name) return { error: 'missingName' }
  const county = toDisplayCountyName(sourceCounty)
  if (!toSourceCountyName(county)) return { error: 'invalidCounty' }
  return { temple: {
    id, name, type: normalizeText(properties['類型']),
    religion: normalizeText(properties['教別']),
    deity: normalizeText(properties['主祀神祇']),
    county, sourceCounty,
    address: normalizeText(properties['地址']),
    phone: normalizeText(properties['電話']),
    longitude: feature.geometry.coordinates[0],
    latitude: feature.geometry.coordinates[1],
    sourceUrl,
  } }
}

export function isPublishedTemple(temple) {
  return temple?.type === '寺廟' &&
    (temple.religion === '道教' || temple.religion === '佛教') &&
    uuidPattern.test(temple.id) && Boolean(normalizeText(temple.name)) &&
    Boolean(toSourceCountyName(temple.county)) &&
    isValidCoordinates([temple.longitude, temple.latitude])
}
