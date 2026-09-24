import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Flag, Footprints, RotateCcw } from 'lucide-react'
import { useSettings } from '../../../state/SettingsContext.js'
import './maze.css'

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

function createMaze(size) {
  const random = createSeededRandom(20260921)

  const cells = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      visited: false,
      walls: {
        top: true,
        right: true,
        bottom: true,
        left: true,
      },
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

export default function MazeGame({ onComplete, taskId = 'maze', disabled = false }) {
  const { t } = useSettings()
  const [player, setPlayer] = useState(START)
  const [moves, setMoves] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasCompleted = useRef(false)

  const movePlayer = useCallback(
    (rowChange, columnChange) => {
      if (isComplete || disabled || !canMove(player, rowChange, columnChange)) return

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
            taskId,
            completedAt: new Date().toISOString(),
            evidence: {
              kind: 'maze',
              moves: moves + 1,
              reachedGoal: true,
            },
          })
        }
      }
    },
    [disabled, isComplete, moves, onComplete, player, taskId],
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
    <section className={`qian-game maze-game${isComplete ? ' is-complete' : ''}`} aria-labelledby="maze-title">
      <header className="qian-game__header">
        <p className="qian-game__eyebrow">{t('maze.eyebrow')}</p>
        <h2 id="maze-title">{t('maze.title')}</h2>
        <p>{t('maze.instructions')}</p>
      </header>

      <div className="qian-board maze-game__board" role="grid" aria-label={t('maze.board')}>
        {MAZE.map((row, rowIndex) =>
          row.map((cell, columnIndex) => {
            const isPlayer =
              player.row === rowIndex && player.column === columnIndex
            const isGoal =
              GOAL.row === rowIndex && GOAL.column === columnIndex

            return (
              <div
                className={`maze-game__cell${isGoal ? ' is-goal' : ''}`}
                key={`${rowIndex}-${columnIndex}`}
                role="gridcell"
                style={{
                  borderTop: cell.walls.top ? '2px solid var(--maze-wall)' : '0',
                  borderLeft: cell.walls.left ? '2px solid var(--maze-wall)' : '0',
                  borderRight: columnIndex === SIZE - 1 && cell.walls.right ? '2px solid var(--maze-wall)' : '0',
                  borderBottom: rowIndex === SIZE - 1 && cell.walls.bottom ? '2px solid var(--maze-wall)' : '0',
                }}
              >
                {isPlayer && <span className="maze-game__traveler" aria-label={t('maze.traveler')}><Footprints aria-hidden="true" /></span>}
                {isGoal && !isPlayer && <span className="maze-game__goal" aria-label={t('maze.goal')}><Flag aria-hidden="true" /></span>}
              </div>
            )
          }),
        )}
      </div>

      <p className="qian-game__status maze-game__status" aria-live="polite">
        {isComplete
          ? t('maze.complete', { moves })
          : t('maze.progress', { moves })}
      </p>

      <div className="maze-game__controls" aria-label={t('maze.controls')}>
        <button type="button" onClick={() => movePlayer(-1, 0)} disabled={disabled || isComplete || !canMove(player, -1, 0)} aria-label={t('maze.up')} title={t('maze.up')}>
          <ArrowUp aria-hidden="true" />
        </button>

        <div>
          <button type="button" onClick={() => movePlayer(0, -1)} disabled={disabled || isComplete || !canMove(player, 0, -1)} aria-label={t('maze.left')} title={t('maze.left')}>
            <ArrowLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={() => movePlayer(1, 0)} disabled={disabled || isComplete || !canMove(player, 1, 0)} aria-label={t('maze.down')} title={t('maze.down')}>
            <ArrowDown aria-hidden="true" />
          </button>
          <button type="button" onClick={() => movePlayer(0, 1)} disabled={disabled || isComplete || !canMove(player, 0, 1)} aria-label={t('maze.right')} title={t('maze.right')}>
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>

      {isComplete && (
        <button className="task-button is-secondary maze-game__restart" type="button" onClick={handleRestart}>
          <RotateCcw size={18} aria-hidden="true" />
          {t('maze.restart')}
        </button>
      )}
    </section>
  )
}
