import { useCallback, useRef, useState } from 'react'
import { createStartingTiles, isSolved, PUZZLE_GRID_SIZE, swapTiles } from './puzzleRules.js'
import templeImageUrl from './wan-chun-temple.jpeg'
import './puzzleTask.css'
import { useSettings } from '../../../state/SettingsContext.js'

const DEFAULT_IMAGE_URL = templeImageUrl

function tileBackgroundPosition(tile) {
  const column = tile % PUZZLE_GRID_SIZE
  const row = Math.floor(tile / PUZZLE_GRID_SIZE)
  const step = 100 / (PUZZLE_GRID_SIZE - 1)
  return `${column * step}% ${row * step}%`
}

/**
 * A small, position-based 3 × 3 image puzzle.
 *
 * @param {{ imageUrl?: string, onComplete?: (result: object) => void, disabled?: boolean }} props
 */
export default function PuzzleTask({
  imageUrl = DEFAULT_IMAGE_URL,
  onComplete,
  disabled = false,
}) {
  const { t } = useSettings()
  const [tiles, setTiles] = useState(createStartingTiles)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const hasReportedCompletion = useRef(false)

  // Completion is deliberately checked from the tile positions, not a separate
  // "finish" action. The callback is protected so a re-render cannot submit twice.
  const handleSubmit = useCallback(
    (nextTiles) => {
      if (!isSolved(nextTiles) || hasReportedCompletion.current) return false

      hasReportedCompletion.current = true
      setIsComplete(true)
      onComplete?.({
        taskId: 'puzzle',
        completedAt: new Date().toISOString(),
        evidence: { kind: 'puzzle', tileOrder: nextTiles },
      })
      return true
    },
    [onComplete],
  )

  function handleTileClick(index) {
    if (isComplete || disabled) return

    if (selectedIndex === null) {
      setSelectedIndex(index)
      return
    }

    if (selectedIndex === index) {
      setSelectedIndex(null)
      return
    }

    const nextTiles = swapTiles(tiles, selectedIndex, index)
    setTiles(nextTiles)
    setSelectedIndex(null)
    handleSubmit(nextTiles)
  }

  function handleRestart() {
    hasReportedCompletion.current = false
    setTiles(createStartingTiles())
    setSelectedIndex(null)
    setIsComplete(false)
  }

  return (
    <section className="puzzle-task" aria-labelledby="puzzle-title">
      <header className="puzzle-task__header">
        <p className="puzzle-task__eyebrow">{t('puzzle.eyebrow')}</p><h2 id="puzzle-title">{t('puzzle.title')}</h2><p id="puzzle-instructions">{t('puzzle.instructions')}</p>
      </header>

      <div
        className="puzzle-board"
        role="group"
        aria-describedby="puzzle-instructions"
        aria-label={t('puzzle.board')}
      >
        {tiles.map((tile, index) => (
          <button
            className={`puzzle-tile${selectedIndex === index ? ' is-selected' : ''}`}
            key={`${tile}-${index}`}
            type="button"
            onClick={() => handleTileClick(index)}
            disabled={isComplete || disabled}
            aria-pressed={selectedIndex === index}
            aria-label={t('puzzle.tile', { position: index + 1, tile: tile + 1, selected: selectedIndex === index ? t('puzzle.selected') : '' })}
            style={{
              backgroundImage: `url("${imageUrl}")`,
              backgroundPosition: tileBackgroundPosition(tile),
            }}
          />
        ))}
      </div>

      <p className="puzzle-task__status" aria-live="polite">
        {isComplete
          ? t('puzzle.complete')
          : selectedIndex === null
            ? t('puzzle.selectFirst')
            : t('puzzle.selectSecond')}
      </p>

      {isComplete && (
        <button className="puzzle-task__restart" type="button" onClick={handleRestart}>
          {t('puzzle.restart')}
        </button>
      )}
    </section>
  )
}
