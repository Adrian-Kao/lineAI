import test from 'node:test'
import assert from 'node:assert/strict'
import { applyDemoMapColoring, deriveRegionProgress, REGION_STATUS_COLORS } from '../features/map/regionStatus.js'

const districts = {
  features: [
    { properties: { COUNTYCODE: 'A', TOWNCODE: 'A1' } },
    { properties: { COUNTYCODE: 'A', TOWNCODE: 'A2' } },
    { properties: { COUNTYCODE: 'B', TOWNCODE: 'B1' } },
  ],
}

test('keeps incomplete districts ink gray and completed districts ochre yellow', () => {
  const result = deriveRegionProgress({ A1: 'inProgress' }, districts)

  assert.equal(result.A1, 'inProgress')
  assert.equal(result.A2, 'locked')
})

test('turns every district terracotta when its entire county is complete', () => {
  const result = deriveRegionProgress({ A1: 'inProgress', A2: 'inProgress' }, districts)

  assert.equal(result.A1, 'unlocked')
  assert.equal(result.A2, 'unlocked')
})

test('uses the ink-gray, ochre-yellow, and terracotta color scale', () => {
  assert.deepEqual(REGION_STATUS_COLORS.locked.fill, [226, 231, 229, 255])
  assert.deepEqual(REGION_STATUS_COLORS.inProgress.fill, [244, 193, 66, 255])
  assert.deepEqual(REGION_STATUS_COLORS.unlocked.fill, [215, 166, 116, 255])
})

test('demo map coloring applies fixed county and district states only when enabled', () => {
  const district = (countyCode, townCode, longitude) => ({
    properties: { COUNTYCODE: countyCode, TOWNCODE: townCode },
    geometry: { type: 'Polygon', coordinates: [[[longitude, 23], [longitude + 0.05, 23], [longitude + 0.05, 23.05], [longitude, 23.05], [longitude, 23]]] },
  })
  const collection = { features: [
    district('63000', '63000010', 121.5),
    district('67000', '67000010', 120.2),
    district('09007', '09007010', 119.9),
    ...Array.from({ length: 7 }, (_, index) => district('65000', `650000${index + 1}`, 120.4 + index * 0.06)),
  ] }
  assert.deepEqual(applyDemoMapColoring({}, collection, false), {})
  const result = applyDemoMapColoring({}, collection, true)
  const statuses = Object.values(result)
  assert.equal(result['63000010'], 'unlocked')
  assert.equal(result['67000010'], 'unlocked')
  assert.equal(result['09007010'], 'locked')
  assert.equal(statuses.filter(status => status === 'unlocked').length, 2)
  assert.equal(statuses.filter(status => status === 'inProgress').length, 5)
  assert.equal(statuses.filter(status => status !== 'locked').length / statuses.length, 0.7)
})

test('demo map coloring includes individual completed districts and Hualien City', () => {
  const feature = (countyCode, townCode, longitude) => ({
    properties: { COUNTYCODE: countyCode, TOWNCODE: townCode },
    geometry: { type: 'Polygon', coordinates: [[[longitude, 23], [longitude + 0.03, 23], [longitude + 0.03, 23.03], [longitude, 23.03], [longitude, 23]]] },
  })
  const collection = { features: [
    feature('65000', '65000010', 121.4),
    feature('10015', '10015010', 121.6),
    feature('09007', '09007010', 119.9),
    ...Array.from({ length: 7 }, (_, index) => feature('10008', `100080${index + 1}`, 120.2 + index * 0.05)),
  ] }
  const result = applyDemoMapColoring({}, collection, true)
  assert.equal(result['65000010'], 'unlocked')
  assert.equal(result['10015010'], 'inProgress')
  assert.equal(result['09007010'], 'locked')
})
