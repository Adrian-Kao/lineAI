import test from 'node:test'
import assert from 'node:assert/strict'
import { isTempleInDistrict } from './districtGeometry.js'

const square = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
const hole = [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]
test('district filtering excludes outside locations and polygon holes', () => {
  const feature = { geometry: { type: 'Polygon', coordinates: [square, hole] } }
  assert.equal(isTempleInDistrict({ longitude: 2, latitude: 2 }, feature), true)
  assert.equal(isTempleInDistrict({ longitude: 12, latitude: 2 }, feature), false)
  assert.equal(isTempleInDistrict({ longitude: 5, latitude: 5 }, feature), false)
})
test('district filtering supports detached islands in MultiPolygon', () => {
  const feature = { geometry: { type: 'MultiPolygon', coordinates: [[square], [square.map(([x, y]) => [x + 20, y])]] } }
  assert.equal(isTempleInDistrict({ longitude: 22, latitude: 2 }, feature), true)
  assert.equal(isTempleInDistrict({ longitude: 15, latitude: 2 }, feature), false)
})
