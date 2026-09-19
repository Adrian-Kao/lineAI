import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatTaipeiDate } from './formatTime.js'

test('formats a collection timestamp as a Taipei date without time', () => {
  const formatted = formatTaipeiDate('2026-09-19T16:30:00.000Z')
  assert.equal(formatted, '2026/09/20')
})
