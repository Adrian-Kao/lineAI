import assert from 'node:assert/strict'
import test from 'node:test'
import { buildStampEntries, formatStampDate, getPlayableStampCatalog } from '../features/collection/stampBookData.js'

test('production catalog only counts the currently playable temple', () => {
  assert.equal(getPlayableStampCatalog(false).length, 1)
  assert.equal(getPlayableStampCatalog(false)[0].templeId, 'wanchun')
  assert.equal(getPlayableStampCatalog(true).length, 6)
})

test('stamp entries derive collection state from records without inventing dates', () => {
  const entries = buildStampEntries(getPlayableStampCatalog(true), [])
  assert.equal(entries.filter(entry => entry.collected).length, 0)
  assert.ok(entries.every(entry => entry.collectedAt === null))
})

test('legacy stamp task maps only to Wanchun while future records use templeId', () => {
  const entries = buildStampEntries(getPlayableStampCatalog(true), [
    { taskId: 'stamp', acquiredAt: '2026-09-20T10:30:00+08:00' },
    { templeId: 'lecheng', acquiredAt: '2026-09-21T10:30:00+08:00' },
  ])
  assert.equal(entries.find(entry => entry.templeId === 'wanchun').collected, true)
  assert.equal(entries.find(entry => entry.templeId === 'lecheng').collected, true)
  assert.equal(entries.find(entry => entry.templeId === 'xingtian').collected, false)
})

test('stamp dates use a Taipei numeric date and reject invalid values', () => {
  assert.equal(formatStampDate('2026-09-20T23:30:00Z'), '2026.09.21')
  assert.equal(formatStampDate('not-a-date'), '')
})
