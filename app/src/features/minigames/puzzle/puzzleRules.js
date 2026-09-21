export const PUZZLE_GRID_SIZE = 3
export const PUZZLE_TILE_COUNT = PUZZLE_GRID_SIZE ** 2

export function createStartingTiles(random = Math.random) {
  const tiles = Array.from({ length: PUZZLE_TILE_COUNT }, (_, index) => index)
  for (let index = tiles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[tiles[index], tiles[swapIndex]] = [tiles[swapIndex], tiles[index]]
  }
  if (isSolved(tiles)) [tiles[0], tiles[1]] = [tiles[1], tiles[0]]
  return tiles
}

export function swapTiles(tiles, a, b) {
  if (
    !Array.isArray(tiles) ||
    ![a, b].every(
      (index) => Number.isInteger(index) && index >= 0 && index < tiles.length,
    )
  ) {
    throw new Error('無效的碎片位置')
  }

  const next = [...tiles]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

export function isSolved(tiles) {
  return Array.isArray(tiles) && tiles.length === PUZZLE_TILE_COUNT && tiles.every((tile, index) => tile === index)
}
