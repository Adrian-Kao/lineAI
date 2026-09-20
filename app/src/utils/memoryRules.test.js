import test from 'node:test'
import assert from 'node:assert/strict'
import { ARTIFACT_IDS, countMoves, createDeck, createState, flipCard, hideMismatch, isMemorySolved, isSolved, isValidDeck, replayFlips } from '../features/minigames/memory/memoryRules.js'

test('createDeck is deterministic per seed and always contains exact pairs', () => {
  const a = createDeck({ seed: 'player-1' })
  const b = createDeck({ seed: 'player-1' })
  assert.deepEqual(a, b)
  assert.equal(a.length, 16)
  assert.equal(isValidDeck(a), true)
  assert.notDeepEqual(createDeck({ seed: 'player-2' }), a)
  assert.equal(isValidDeck(['censer', 'censer', 'bell']), false)
  assert.equal(isValidDeck(['censer', 'nope']), false)
  assert.throws(() => createDeck({ pairs: ARTIFACT_IDS.length + 1 }), /配對數量/)
})

test('matching two equal cards keeps them open, unequal cards are marked mismatched then hidden', () => {
  const deck = ['bell', 'drum', 'bell', 'drum']
  let state = flipCard(createState(deck), 0)
  assert.deepEqual(state.faceUp, [0])
  state = flipCard(state, 2)
  assert.deepEqual(state.matched, [0, 2])
  assert.deepEqual(state.faceUp, [])
  state = flipCard(flipCard(state, 1), 0) // 0 is matched → ignored
  assert.deepEqual(state.faceUp, [1])
  state = flipCard(state, 3)
  assert.deepEqual(state.matched, [0, 2, 1, 3])
  assert.equal(isSolved(state), true)

  let miss = flipCard(flipCard(createState(deck), 0), 1)
  assert.equal(miss.mismatched, true)
  assert.deepEqual(miss.faceUp, [0, 1])
  miss = hideMismatch(miss)
  assert.deepEqual(miss.faceUp, [])
  assert.equal(miss.mismatched, false)
})

test('flipping while a mismatch is showing hides it first, and the same card cannot be flipped twice', () => {
  const deck = ['bell', 'drum', 'bell', 'drum']
  const miss = flipCard(flipCard(createState(deck), 0), 1)
  const next = flipCard(miss, 2)
  assert.deepEqual(next.faceUp, [2])
  const same = flipCard(createState(deck), 0)
  assert.equal(flipCard(same, 0), same)
  assert.throws(() => flipCard(same, 9), /無效的牌位置/)
})

test('replayFlips verifies completion from deck and flips only', () => {
  const deck = createDeck({ seed: 'demo', pairs: 3 })
  // Solve by brute force: flip every index in order of pair id.
  const order = [...deck.keys()].sort((x, y) => deck[x].localeCompare(deck[y]) || x - y)
  assert.equal(isMemorySolved(deck, order), true)
  assert.equal(countMoves(order), 3)
  assert.equal(isMemorySolved(deck, order.slice(0, 4)), false)
  assert.equal(replayFlips(['bad'], []), null)
})
