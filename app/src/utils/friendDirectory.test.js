import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DEMO_FRIEND_DIRECTORY } from '../data/friendDemo.js'
import { findFriendByLookup, normalizeFriendLookup, validateFriendLookup } from './friendDirectory.js'

test('normalizes phone and LINE ID friend searches', () => {
  assert.equal(normalizeFriendLookup('phone', '0912-345-678'), '0912345678')
  assert.equal(normalizeFriendLookup('lineId', '@AN.Temple'), 'an.temple')
})

test('finds demo friends using either lookup type', () => {
  assert.equal(findFriendByLookup(DEMO_FRIEND_DIRECTORY, 'phone', '0912-345-678')?.id, 'friend-an')
  assert.equal(findFriendByLookup(DEMO_FRIEND_DIRECTORY, 'lineId', '@QING.TRAVEL')?.id, 'friend-qing')
  assert.equal(findFriendByLookup(DEMO_FRIEND_DIRECTORY, 'phone', '0911111111'), null)
  assert.throws(() => validateFriendLookup('lineId', 'x'))
})
