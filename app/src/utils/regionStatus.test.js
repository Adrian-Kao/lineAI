import test from 'node:test'
import assert from 'node:assert/strict'
import { deriveRegionProgress, REGION_STATUS_COLORS } from '../features/map/regionStatus.js'

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
  assert.deepEqual(REGION_STATUS_COLORS.inProgress.fill, [235, 217, 158, 255])
  assert.deepEqual(REGION_STATUS_COLORS.unlocked.fill, [215, 166, 116, 255])
})
