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

test('keeps incomplete districts gray and completed districts light green', () => {
  const result = deriveRegionProgress({ A1: 'inProgress' }, districts)

  assert.equal(result.A1, 'inProgress')
  assert.equal(result.A2, 'locked')
})

test('turns every district dark green when its entire county is complete', () => {
  const result = deriveRegionProgress({ A1: 'inProgress', A2: 'inProgress' }, districts)

  assert.equal(result.A1, 'unlocked')
  assert.equal(result.A2, 'unlocked')
})

test('uses the gray, light-green, and dark-green color scale', () => {
  assert.deepEqual(REGION_STATUS_COLORS.locked.fill, [222, 223, 226, 255])
  assert.deepEqual(REGION_STATUS_COLORS.inProgress.fill, [207, 234, 200, 255])
  assert.deepEqual(REGION_STATUS_COLORS.unlocked.fill, [64, 124, 79, 255])
})
