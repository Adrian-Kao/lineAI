import assert from 'node:assert/strict'
import { test } from 'node:test'
import { groupAdministrativeRegions } from '../services/administrativeRegions.js'

test('groups official districts by display county name and sorts them by code', () => {
  const topology = { objects: { districts: { geometries: [
    { properties: { COUNTYNAME: '臺中市', TOWNNAME: '北區', TOWNCODE: '66000050' } },
    { properties: { COUNTYNAME: '彰化縣', TOWNNAME: '彰化市', TOWNCODE: '10007010' } },
    { properties: { COUNTYNAME: '臺中市', TOWNNAME: '中區', TOWNCODE: '66000010' } },
  ] } } }
  const regions = groupAdministrativeRegions(topology)
  assert.deepEqual(regions.map(region => region.name), ['台中市', '彰化縣'])
  assert.deepEqual(regions[0].districts.map(district => district.name), ['中區', '北區'])
})
