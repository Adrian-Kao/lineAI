// 點燈祈福（Lights Out 變體）純規則：不碰儲存、不導航，供元件與 gameRules 共用。
// 盤面為長度 size*size 的布林陣列，true = 燈籠已亮。
export const GRID_SIZE = 3
export const DEFAULT_SCRAMBLE_MOVES = 3

export function createSolvedBoard(size = GRID_SIZE) {
  return Array.from({ length: size * size }, () => true)
}

export function getNeighbors(index, size = GRID_SIZE) {
  const row = Math.floor(index / size)
  const column = index % size
  const cells = [index]
  if (row > 0) cells.push(index - size)
  if (row < size - 1) cells.push(index + size)
  if (column > 0) cells.push(index - 1)
  if (column < size - 1) cells.push(index + 1)
  return cells
}

export function toggleLantern(board, index, size = GRID_SIZE) {
  if (!Array.isArray(board) || board.length !== size * size) throw new Error('盤面大小不正確')
  if (!Number.isInteger(index) || index < 0 || index >= board.length) throw new Error('無效的燈籠位置')
  const next = [...board]
  for (const cell of getNeighbors(index, size)) next[cell] = !next[cell]
  return next
}

export function isSolved(board, size = GRID_SIZE) {
  return Array.isArray(board) && board.length === size * size && board.every(lit => lit === true)
}

// 小型可重現亂數（mulberry32），讓同一 seed 得到同一盤面。
function createRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFromString(text) {
  let hash = 2166136261
  for (const char of String(text)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return hash >>> 0
}

// 由全亮盤面反推隨機幾步，保證有解；不會回傳已經全亮的盤面。
export function createStartingBoard({ seed = Date.now(), moves = DEFAULT_SCRAMBLE_MOVES, size = GRID_SIZE } = {}) {
  const random = createRandom(typeof seed === 'number' ? seed : seedFromString(seed))
  let board = createSolvedBoard(size)
  const used = new Set()
  let attempts = 0
  while (used.size < moves && attempts < moves * 10) {
    attempts += 1
    const index = Math.floor(random() * board.length)
    if (used.has(index)) continue // 同一格點兩次會互相抵銷
    used.add(index)
    board = toggleLantern(board, index, size)
  }
  return isSolved(board, size) ? toggleLantern(board, 0, size) : board
}

// 暴力搜尋最短解（3×3 只有 512 種點法），回傳需要點的格子索引；無解回傳 null。
// 只用於提示，不影響完成判定。
export function solveBoard(board, size = GRID_SIZE) {
  if (!Array.isArray(board) || board.length !== size * size) return null
  const cells = board.length
  if (cells > 16) return null
  let best = null
  for (let mask = 0; mask < 1 << cells; mask++) {
    const count = mask.toString(2).split('1').length - 1
    if (best && count >= best.length) continue
    let next = board
    for (let i = 0; i < cells; i++) if (mask & (1 << i)) next = toggleLantern(next, i, size)
    if (isSolved(next, size)) best = Array.from({ length: cells }, (_, i) => i).filter(i => mask & (1 << i))
  }
  return best
}

