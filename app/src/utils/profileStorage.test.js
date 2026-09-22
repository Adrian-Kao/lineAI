import test from 'node:test'
import assert from 'node:assert/strict'
import { applyProfilePreferences, clearProfilePreferences, makeProfileKey, validateProfileInput } from '../services/profileStorage.js'

test('applies editable profile fields while preserving LINE identity', () => {
  const result = applyProfilePreferences(
    { userId: 'U123', name: 'LINE 名稱', avatar: 'https://example.com/line.jpg' },
    { name: '自訂名稱', phone: '0912-345-678', avatar: 'data:image/jpeg;base64,abc' },
  )
  assert.equal(result.userId, 'U123')
  assert.equal(result.name, '自訂名稱')
  assert.equal(result.phone, '0912-345-678')
  assert.equal(result.lineName, 'LINE 名稱')
  assert.equal(result.lineAvatar, 'https://example.com/line.jpg')
})

test('trims fields and rejects invalid phone characters', () => {
  assert.deepEqual(validateProfileInput({ name: ' 測試玩家 ', phone: ' 0912-345-678 ', avatar: null }), {
    name: '測試玩家', phone: '0912-345-678', avatar: null,
  })
  assert.throws(() => validateProfileInput({ name: '測試玩家', phone: 'call me', avatar: null }), /電話格式/)
})

test('clears only the selected account profile preferences', () => {
  const removed = []
  clearProfilePreferences('U123', { removeItem: key => removed.push(key) })
  assert.deepEqual(removed, [makeProfileKey('U123')])
})
