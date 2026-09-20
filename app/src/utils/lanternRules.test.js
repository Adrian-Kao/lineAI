import test from 'node:test'
import assert from 'node:assert/strict'
import { createSolvedBoard, createStartingBoard, getNeighbors, isSolved, solveBoard, toggleLantern } from '../features/minigames/lantern/lanternRules.js'

test('toggling flips the lantern and its orthogonal neighbours only', () => {
  const board = createSolvedBoard()
  const next = toggleLantern(board, 4) // centre
  assert.deepEqual(next.map(Number), [1, 0, 1, 0, 0, 0, 1, 0, 1])
  assert.deepEqual(getNeighbors(0).sort(), [0, 1, 3])
  assert.deepEqual(getNeighbors(8).sort(), [5, 7, 8])
  assert.equal(board[4], true, 'original board is not mutated')
})

test('toggling the same lantern twice restores the board', () => {
  const board = createSolvedBoard()
  assert.deepEqual(toggleLantern(toggleLantern(board, 2), 2), board)
})

test('isSolved only accepts a full 3×3 board with every lantern lit', () => {
  assert.equal(isSolved(createSolvedBoard()), true)
  assert.equal(isSolved(toggleLantern(createSolvedBoard(), 0)), false)
  assert.equal(isSolved([true, true, true]), false)
  assert.equal(isSolved('not a board'), false)
})

test('starting board is deterministic per seed, never solved, and always solvable', () => {
  const a = createStartingBoard({ seed: 'player-1' })
  const b = createStartingBoard({ seed: 'player-1' })
  assert.deepEqual(a, b)
  assert.equal(isSolved(a), false)
  // Lights Out on 3×3 is fully solvable; brute-force every tap subset to confirm.
  let solvable = false
  for (let mask = 0; mask < 512 && !solvable; mask++) {
    let board = a
    for (let i = 0; i < 9; i++) if (mask & (1 << i)) board = toggleLantern(board, i)
    solvable = isSolved(board)
  }
  assert.equal(solvable, true)
})

test('invalid toggles are rejected', () => {
  assert.throws(() => toggleLantern(createSolvedBoard(), 9), /無效的燈籠位置/)
  assert.throws(() => toggleLantern([true], 0), /盤面大小不正確/)
})

test('solveBoard returns a minimal tap set that lights every lantern', () => {
  const board = toggleLantern(toggleLantern(createSolvedBoard(), 1), 7)
  const solution = solveBoard(board)
  assert.deepEqual(solution, [1, 7])
  assert.deepEqual(solveBoard(createSolvedBoard()), [])
  const start = createStartingBoard({ seed: 'demo' })
  const applied = solveBoard(start).reduce((current, index) => toggleLantern(current, index), start)
  assert.equal(isSolved(applied), true)
})
