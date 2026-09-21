import { useCallback, useEffect, useRef, useState } from 'react'
import './wanxingMaze.css'

const SIZE = 13
const START = { row: 12, column: 6 }
const GOAL = { row: 0, column: 12 }

function createSeededRandom(seed) {
  let value = seed

  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

// 以固定亂數種子產生迷宮：每次進入都是同一個可通關迷宮。
function createMaze(size) {
  const random = createSeededRandom(20260921)

  const cells = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      visited: false,
      walls: { top: true, right: true, bottom: true, left: true },
    })),
  )

  const directions = [
    { row: -1, column: 0, wall: 'top', opposite: 'bottom' },
    { row: 0, column: 1, wall: 'right', opposite: 'left' },
    { row: 1, column: 0, wall: 'bottom', opposite: 'top' },
    { row: 0, column: -1, wall: 'left', opposite: 'right' },
  ]

  const stack = [{ row: 0, column: 0 }]
  cells[0][0].visited = true

  while (stack.length > 0) {
    const current = stack[stack.length - 1]

    const choices = directions.filter((direction) => {
      const nextRow = current.row + direction.row
      const nextColumn = current.column + direction.column

      return (
        nextRow >= 0 &&
        nextRow < size &&
        nextColumn >= 0 &&
        nextColumn < size &&
        !cells[nextRow][nextColumn].visited
      )
    })

    if (choices.length === 0) {
      stack.pop()
      continue
    }

    const direction = choices[Math.floor(random() * choices.length)]
    const nextRow = current.row + direction.row
    const nextColumn = current.column + direction.column

    cells[current.row][current.column].walls[direction.wall] = false
    cells[nextRow][nextColumn].walls[direction.opposite] = false
    cells[nextRow][nextColumn].visited = true
    stack.push({ row: nextRow, column: nextColumn })
  }

  return cells
}

const MAZE = createMaze(SIZE)

function canMove(player, rowChange, columnChange) {
  const nextRow = player.row + rowChange
  const nextColumn = player.column + columnChange

  if (
    nextRow < 0 ||
    nextRow >= SIZE ||
    nextColumn < 0 ||
    nextColumn >= SIZE
  ) {
    return false
  }

  const walls = MAZE[player.row][player.column].walls

  if (rowChange === -1) return !walls.top
  if (rowChange === 1) return !walls.bottom
  if (columnChange === -1) return !walls.left
  if (columnChange === 1) return !walls.right

  return false
}

export default function WanxingMaze({ onComplete, entranceImageUrl }) {
  const [player, setPlayer] = useState(START)
  const [moves, setMoves] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasCompleted = useRef(false)

  const movePlayer = useCallback(
    (rowChange, columnChange) => {
      if (isComplete || !canMove(player, rowChange, columnChange)) return

      const nextPlayer = {
        row: player.row + rowChange,
        column: player.column + columnChange,
      }

      setPlayer(nextPlayer)
      setMoves((count) => count + 1)

      if (
        nextPlayer.row === GOAL.row &&
        nextPlayer.column === GOAL.column
      ) {
        setIsComplete(true)

        if (!hasCompleted.current) {
          hasCompleted.current = true

          onComplete?.({
            taskId: 'wanxing-maze',
            completedAt: new Date().toISOString(),
            evidence: {
              kind: 'wanxing-maze',
              moves: moves + 1,
              reachedEntrance: true,
            },
          })
        }
      }
    },
    [isComplete, moves, onComplete, player],
  )

  useEffect(() => {
    function handleKeyDown(event) {
      const directions = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      }

      if (!directions[event.key]) return

      event.preventDefault()
      movePlayer(...directions[event.key])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [movePlayer])

  function handleRestart() {
    hasCompleted.current = false
    setPlayer(START)
    setMoves(0)
    setIsComplete(false)
  }

  return (
    <section className="wanxing-maze" aria-labelledby="wanxing-maze-title">
      <header>
        <p className="wanxing-maze__eyebrow">台中社口萬興宮</p>
        <h2 id="wanxing-maze-title">尋找公廟入口</h2>
        <p>迷宮較複雜，請使用方向鍵或按鈕帶小旅人抵達入口。</p>
      </header>

      <div
        className="wanxing-maze__board"
        role="grid"
        aria-label="社口萬興宮迷宮"
      >
        {MAZE.map((row, rowIndex) =>
          row.map((cell, columnIndex) => {
            const isPlayer =
              player.row === rowIndex && player.column === columnIndex
            const isGoal =
              GOAL.row === rowIndex && GOAL.column === columnIndex

            return (
              <div
                className={[
                  'wanxing-maze__cell',
                  isGoal ? 'is-goal' : '',
                ].join(' ')}
                key={`${rowIndex}-${columnIndex}`}
                role="gridcell"
                style={{
                  borderTop: cell.walls.top ? '3px solid #111' : '0',
                  borderRight: cell.walls.right ? '3px solid #111' : '0',
                  borderBottom: cell.walls.bottom ? '3px solid #111' : '0',
                  borderLeft: cell.walls.left ? '3px solid #111' : '0',
                  backgroundImage:
                    isGoal && entranceImageUrl
                      ? `url("${entranceImageUrl}")`
                      : undefined,
                }}
              >
                {isPlayer && <span aria-label="小旅人">🚶</span>}
                {isGoal && !isPlayer && (
                  <span aria-label="萬興宮入口">⛩️</span>
                )}
              </div>
            )
          }),
        )}
      </div>

      <p className="wanxing-maze__status" aria-live="polite">
        {isComplete
          ? `成功抵達萬興宮入口！共走了 ${moves} 步。`
          : `目前已走 ${moves} 步。`}
      </p>

      <div className="wanxing-maze__controls" aria-label="移動控制">
        <button type="button" onClick={() => movePlayer(-1, 0)} aria-label="向上走">
          ↑
        </button>

        <div>
          <button type="button" onClick={() => movePlayer(0, -1)} aria-label="向左走">
            ←
          </button>
          <button type="button" onClick={() => movePlayer(1, 0)} aria-label="向下走">
            ↓
          </button>
          <button type="button" onClick={() => movePlayer(0, 1)} aria-label="向右走">
            →
          </button>
        </div>
      </div>

      {isComplete && (
        <button className="wanxing-maze__restart" type="button" onClick={handleRestart}>
          再玩一次
        </button>
      )}
    </section>
  )
}