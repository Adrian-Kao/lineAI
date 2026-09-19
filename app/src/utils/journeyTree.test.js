import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DEMO_JOURNEY_EVENTS } from '../data/journeyDemo.js'
import { buildJourneyRoadPath, buildJourneyTree, getJourneyStageWidth } from './journeyTree.js'

test('builds a 50-event chronological journey ending on the main route', () => {
  const tree = buildJourneyTree(DEMO_JOURNEY_EVENTS)
  assert.equal(tree.length, 50)
  assert.equal(tree.at(-1).title, '台灣全區完成')
  assert.equal(tree.at(-1).route, 'main')
  assert.ok(tree.slice(0, -1).some(event => event.route === 'top'))
  assert.ok(tree.slice(0, -1).some(event => event.route === 'bottom'))
  assert.ok(new Set(tree.map(event => event.mainY)).size > 10)
  assert.match(buildJourneyRoadPath(tree, getJourneyStageWidth(tree.length)), /^M 40 .+ C /)
  assert.ok(tree.every((event, index) => index === 0 || new Date(event.occurredAt) >= new Date(tree[index - 1].occurredAt)))
})
