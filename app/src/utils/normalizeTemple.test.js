import test from 'node:test'
import assert from 'node:assert/strict'
import { isAllowedTemple, isPublishedTemple, normalizeTemple } from './normalizeTemple.js'
import { toDisplayCountyName, toSourceCountyName } from './countyNames.js'

const id = '92602720-7e90-4bf9-83f3-c02a1105fb7b'
const feature = (overrides = {}) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [120.7, 24.1] },
  properties: { uuid: id, '名稱': '測試宮', '類型': '寺廟', '教別': '道教', '主祀神祇': '觀世音菩薩', ...overrides },
})

test('religion is classified from the explicit field, not deity', () => {
  const daoist = feature()
  assert.equal(isAllowedTemple(daoist), true)
  assert.equal(normalizeTemple(daoist, '臺中市', 'https://example.com').temple.religion, '道教')
  assert.equal(isAllowedTemple(feature({ '教別': '' })), false)
  assert.equal(isAllowedTemple(feature({ '教別': '其他' })), false)
  assert.equal(isAllowedTemple(feature({ '類型': '教會', '教別': '佛教' })), false)
  assert.equal(isAllowedTemple(feature({ '教別': '佛教' })), true)
})

test('invalid point, coordinates, uuid, or name are rejected', () => {
  assert.equal(normalizeTemple({ ...feature(), geometry: { type: 'Polygon', coordinates: [] } }, '臺中市', '').error, 'invalidGeometry')
  assert.equal(normalizeTemple({ ...feature(), geometry: { type: 'Point', coordinates: [24.1, 120.7] } }, '臺中市', '').error, 'invalidCoordinates')
  assert.equal(normalizeTemple(feature({ uuid: 'bad' }), '臺中市', '').error, 'invalidUuid')
  assert.equal(normalizeTemple(feature({ '名稱': ' ' }), '臺中市', '').error, 'missingName')
})

test('county aliases remain explicit and IDs distinguish same-named temples', () => {
  assert.equal(toDisplayCountyName('臺中市'), '台中市')
  assert.equal(toSourceCountyName('台中市'), '臺中市')
  assert.equal(toSourceCountyName('台中縣'), null)
  const first = normalizeTemple(feature(), '臺中市', '').temple
  const second = normalizeTemple(feature({ uuid: 'b1600c86-e596-44c3-9703-97e6b579a809' }), '臺中市', '').temple
  assert.equal(first.name, second.name)
  assert.notEqual(first.id, second.id)
  assert.equal(isPublishedTemple(first), true)
  assert.equal(isPublishedTemple({ ...first, religion: '其他' }), false)
})
