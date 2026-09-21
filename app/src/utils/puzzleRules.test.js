import test from 'node:test'
import assert from 'node:assert/strict'
import { createStartingTiles, isSolved, PUZZLE_TILE_COUNT } from '../features/minigames/puzzle/puzzleRules.js'

test('3 × 3 puzzle starts shuffled with every tile exactly once', () => {
  const tiles = createStartingTiles(() => 0)
  assert.equal(tiles.length, PUZZLE_TILE_COUNT)
  assert.deepEqual([...tiles].sort((a, b) => a - b), Array.from({ length: PUZZLE_TILE_COUNT }, (_, index) => index))
  assert.equal(isSolved(tiles), false)
})

test('puzzle shuffle can produce different starting boards', () => {
  assert.notDeepEqual(createStartingTiles(() => 0), createStartingTiles(() => 0.75))
})

test('only a complete ordered 3 × 3 board is solved', () => {
  assert.equal(isSolved(Array.from({ length: PUZZLE_TILE_COUNT }, (_, index) => index)), true)
  assert.equal(isSolved([0, 1, 2, 3]), false)
})
