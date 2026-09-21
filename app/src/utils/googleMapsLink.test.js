import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDirectionsUrl } from './googleMapsLink.js'

test('有座標時以座標作為目的地', () => {
  assert.equal(buildDirectionsUrl({ latitude: 24.1417, longitude: 120.6836, name: '萬春宮', address: '臺中市中區成功路212號' }),
    'https://www.google.com/maps/dir/?api=1&destination=24.1417%2C120.6836')
})

test('缺座標時退回名稱與地址', () => {
  assert.equal(buildDirectionsUrl({ name: '萬春宮', address: '臺中市中區成功路212號' }),
    'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('萬春宮 臺中市中區成功路212號'))
})

test('沒有任何可用資訊時回傳 null', () => {
  assert.equal(buildDirectionsUrl({}), null)
  assert.equal(buildDirectionsUrl(null), null)
})
