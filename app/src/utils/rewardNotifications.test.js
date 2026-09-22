import assert from 'node:assert/strict'
import test from 'node:test'
import { buildDemoRewardNotifications, buildRewardNotifications } from '../features/rewards/rewardNotifications.js'
import { createInitialState, gameReducer } from '../state/gameReducer.js'

test('queues simultaneous rewards from smallest scope to largest scope', () => {
  const previous = createInitialState()
  const next = {
    ...previous,
    stampRecords: [{ templeId: 'wanchun', acquiredAt: '2026-09-23T00:00:00.000Z' }],
    completedDistrictIds: ['66000010'],
    completedCountyIds: ['台中市'],
    taiwanCompleted: true,
  }
  assert.deepEqual(buildRewardNotifications(previous, next).map(reward => reward.kind), [
    'stamp', 'memory', 'points', 'points', 'points', 'sticker',
  ])
  assert.deepEqual(buildRewardNotifications(previous, next).filter(reward => reward.kind === 'points').map(reward => reward.amount), [50, 200, 1000])
})

test('milestones award LINE points once and persist completion levels', () => {
  const milestone = { districtId: '66000010', countyId: '台中市', taiwanCompleted: true }
  const completed = gameReducer(createInitialState(), { type: 'COLLECTION_MILESTONE_COMPLETED', payload: milestone })
  assert.equal(completed.linePoints, 1250)
  assert.deepEqual(completed.completedDistrictIds, ['66000010'])
  assert.deepEqual(completed.completedCountyIds, ['台中市'])
  assert.equal(completed.taiwanCompleted, true)
  assert.equal(gameReducer(completed, { type: 'COLLECTION_MILESTONE_COMPLETED', payload: milestone }), completed)
})

test('demo reward sequence contains all six notifications in presentation order', () => {
  const rewards = buildDemoRewardNotifications()
  assert.deepEqual(rewards.map(reward => reward.kind), ['stamp', 'memory', 'points', 'points', 'points', 'sticker'])
  assert.deepEqual(rewards.filter(reward => reward.kind === 'points').map(reward => reward.amount), [50, 200, 1000])
})
