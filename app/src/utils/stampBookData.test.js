import assert from 'node:assert/strict'
import test from 'node:test'
import { buildStampEntries, formatStampDate, formatStampTempleName, getPlayableStampCatalog } from '../features/collection/stampBookData.js'

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

test('stamp book removes the legal-entity prefix from temple names', () => {
  assert.equal(formatStampTempleName('財團法人臺中市大覺院'), '大覺院')
  assert.equal(formatStampTempleName('萬春宮'), '萬春宮')
  const [entry] = buildStampEntries([{ templeId: 'demo', sourceId: 'demo', templeName: '財團法人測試宮', county: '台中市', district: '中區' }], [])
  assert.equal(entry.templeName, '測試宮')
})

test('stamp book removes a leading Taichung place name', () => {
  assert.equal(formatStampTempleName('台中市慈音寺'), '慈音寺')
  assert.equal(formatStampTempleName('臺中順興宮'), '順興宮')
  assert.equal(formatStampTempleName('財團法人台中市行聖宮'), '行聖宮')
  assert.equal(formatStampTempleName('台中市西區藍興福德祠'), '西區藍興福德祠')
  assert.equal(formatStampTempleName('台灣省台中市法華寺'), '法華寺')
  assert.equal(formatStampTempleName('臺灣省臺中市西區觀善寺'), '西區觀善寺')
  assert.equal(formatStampTempleName('財團法人臺灣省台中聖賢堂'), '聖賢堂')
})
