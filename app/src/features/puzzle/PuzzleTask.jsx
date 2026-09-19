import { useCallback, useRef, useState } from 'react'
import { createStartingTiles, isSolved, swapTiles } from './puzzleRules.js'
import templeImageUrl from './wan-chun-temple.jpeg'
import './puzzleTask.css'

const DEFAULT_IMAGE_URL = templeImageUrl

function tileBackgroundPosition(tile) {
  const column = tile % 2
  const row = Math.floor(tile / 2)
  return `${column * 100}% ${row * 100}%`
}

/**
 * A small, position-based 2 × 2 image puzzle.
 *
 * @param {{ imageUrl?: string, onComplete?: (result: object) => void, disabled?: boolean }} props
 */
export default function PuzzleTask({
  imageUrl = DEFAULT_IMAGE_URL,
  onComplete,
  disabled = false,
}) {
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
        <p className="puzzle-task__eyebrow">廟宇尋寶</p>
        <h2 id="puzzle-title">2 × 2 拼圖</h2>
        <p id="puzzle-instructions">
          點選兩塊碎片交換位置，將圖片恢復完整。
        </p>
      </header>

      <div
        className="puzzle-board"
        role="group"
        aria-describedby="puzzle-instructions"
        aria-label="2 × 2 拼圖棋盤"
      >
        {tiles.map((tile, index) => (
          <button
            className={`puzzle-tile${selectedIndex === index ? ' is-selected' : ''}`}
            key={`${tile}-${index}`}
            type="button"
            onClick={() => handleTileClick(index)}
            disabled={isComplete || disabled}
            aria-pressed={selectedIndex === index}
            aria-label={`第 ${index + 1} 格，目前是圖片第 ${tile + 1} 塊${
              selectedIndex === index ? '，已選取' : ''
            }`}
            style={{
              backgroundImage: `url("${imageUrl}")`,
              backgroundPosition: tileBackgroundPosition(tile),
            }}
          />
        ))}
      </div>

      <p className="puzzle-task__status" aria-live="polite">
        {isComplete
          ? '完成！你已成功拼回萬春宮。'
          : selectedIndex === null
            ? '請先選擇一塊碎片。'
            : '再選擇另一塊碎片即可交換。'}
      </p>

      {isComplete && (
        <button className="puzzle-task__restart" type="button" onClick={handleRestart}>
          再玩一次
        </button>
      )}
    </section>
  )
}
