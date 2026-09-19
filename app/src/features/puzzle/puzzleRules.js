export function createStartingTiles() {
  return [1, 0, 2, 3]
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
  return tiles.length === 4 && tiles.every((tile, index) => tile === index)
}
