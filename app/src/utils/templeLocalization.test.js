import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildTempleDescription,
  localizedValue,
  localizeDeity,
  localizeReligion,
  localizeTempleName,
} from './templeLocalization.js'

const temple = {
  name: '萬春宮',
  county: '台中市',
  religion: '道教',
  deity: '天上聖母',
}
const wanchunContent = { displayName: { 'zh-TW': '萬春宮', en: 'Wanchun Temple' } }

describe('temple localization', () => {
  it('uses translated editorial content when available', () => {
    assert.equal(localizeTempleName(temple, wanchunContent, 'en'), 'Wanchun Temple')
    assert.equal(localizedValue({ 'zh-TW': '歷史內容', en: 'History' }, 'en'), 'History')
  })

  it('translates known classifications while retaining cultural names', () => {
    assert.equal(localizeReligion('道教', 'en', wanchunContent), 'Taoism')
    assert.equal(localizeDeity('天上聖母', 'en', wanchunContent), 'Mazu (天上聖母)')
  })

  it('builds an English introduction without altering the source county name', () => {
    assert.equal(buildTempleDescription(temple, 'en', wanchunContent), 'A Taoist temple in 台中市, primarily dedicated to Mazu (天上聖母).')
  })

  it('keeps unregistered temples in the source language', () => {
    assert.equal(localizeReligion('道教', 'en'), '道教')
    assert.equal(localizeDeity('天上聖母', 'en'), '天上聖母')
    assert.equal(buildTempleDescription(temple, 'en'), '位於台中市的道教寺廟，主祀天上聖母。')
  })
})
