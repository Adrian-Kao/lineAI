import { useMemo, useRef, useState } from 'react'
import { useSettings } from '../../../state/SettingsContext.js'
import { createStartingBoard, getNeighbors, GRID_SIZE, isSolved, solveBoard, toggleLantern } from './lanternRules.js'
import { createTranslator } from './lanternMessages.js'
import LanternIcon from './LanternIcon.jsx'
import LanternTutorial from './LanternTutorial.jsx'
import './lanternGame.css'

// 方案 A：與拼圖共用主線第三格的 taskId，玩法由 evidence.kind 區分。
export const LANTERN_TASK_ID = 'puzzle'


function initialBoard(seed, round) {
  return createStartingBoard({ seed: seed ?? `lantern-${round}` })
}

/**
 * 點燈祈福：3×3 燈籠（Lights Out 變體）。點一盞會翻轉自己與上下左右，全亮即完成。
 * 提示分三層：剩餘步數回饋 → 列提示 → 指定格並說明原因。
 * 完成由盤面狀態決定並回報 evidence，與拼圖相同的 onComplete 介面。
 *
 * @param {{ seed?: string | number, onComplete?: (result: object) => void, disabled?: boolean }} props
 */
export default function LanternGame({ seed, onComplete, disabled = false, showTutorial = true }) {
  const { language, reduceMotion } = useSettings()
  const t = useMemo(() => createTranslator(language), [language])
  const [phase, setPhase] = useState(showTutorial ? 'tutorial' : 'play')
  const [round, setRound] = useState(0)
  const [board, setBoard] = useState(() => initialBoard(seed, 0))
  const [moves, setMoves] = useState([])
  const [hintIndex, setHintIndex] = useState(null)
  const [hintLevel, setHintLevel] = useState(0) // 0 無、1 列提示、2 指定格
  const [lastDelta, setLastDelta] = useState(0) // 上一步讓最少步數 -1 / +1 / 0
  const [hintsUsed, setHintsUsed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasReported = useRef(false)
  const total = board.length
  const litCount = board.filter(Boolean).length
  const locked = isComplete || disabled
  // 目前盤面的最短解，用於「最少還要 n 步」與分層提示。3×3 只有 512 種點法，每次 render 重算沒問題。
  const solution = useMemo(() => (isComplete ? null : solveBoard(board)), [isComplete, board])
  const stepsLeft = solution?.length ?? null
  const hintRow = solution?.length ? Math.floor(solution[0] / GRID_SIZE) + 1 : null

  function handleTap(index) {
    if (locked) return
    const nextBoard = toggleLantern(board, index)
    const nextMoves = [...moves, index]
    setBoard(nextBoard)
    setMoves(nextMoves)
    setHintIndex(null)
    setHintLevel(0)
    if (stepsLeft !== null) setLastDelta(Math.sign((solveBoard(nextBoard)?.length ?? stepsLeft) - stepsLeft))
    if (!isSolved(nextBoard) || hasReported.current) return
    hasReported.current = true
    setIsComplete(true)
    onComplete?.({
      taskId: LANTERN_TASK_ID,
      completedAt: new Date().toISOString(),
      evidence: { kind: 'lantern', size: GRID_SIZE, board: nextBoard, moves: nextMoves, hintsUsed },
    })
  }

  function reset(nextRound) {
    hasReported.current = false
    setRound(nextRound)
    setBoard(initialBoard(seed, nextRound))
    setMoves([])
    setHintIndex(null)
    setHintLevel(0)
    setLastDelta(0)
    setHintsUsed(0)
    setIsComplete(false)
  }

  function handleUndo() {
    if (isComplete || disabled || !moves.length) return
    setBoard(toggleLantern(board, moves.at(-1))) // 同一格再點一次即復原
    setMoves(moves.slice(0, -1))
    setHintIndex(null)
    setHintLevel(0)
    setLastDelta(0)
  }

  function handleHint() {
    if (locked) return
    setHintsUsed(count => count + 1)
    if (!solution?.length) return
    // 第一次只說在哪一列，第二次才指定格子。
    if (hintLevel === 0) { setHintLevel(1); return }
    setHintLevel(2)
    setHintIndex(solution[0])
  }

  // 公布答案時說明原因：這格會翻轉哪幾盞、其中幾盞暗的會被點亮、剩下幾步。
  function explainAnswer(index) {
    const cells = getNeighbors(index)
    const dark = cells.filter(cell => !board[cell]).length
    return t('hintWhy', { position: index + 1, count: cells.length, dark, rest: Math.max(stepsLeft - 1, 0) })
  }

  function guidance() {
    if (hintIndex !== null) return explainAnswer(hintIndex)
    if (hintLevel === 1) return t('hintRow', { row: hintRow })
    if (lastDelta < 0) return t('closer', { steps: stepsLeft })
    if (lastDelta > 0) return t('farther', { steps: stepsLeft })
    return stepsLeft !== null && moves.length ? t('stepsLeft', { steps: stepsLeft }) : t('tip')
  }

  if (phase === 'tutorial') {
    return <section className="qian-game lantern-game" aria-labelledby="lantern-title">
      <header className="qian-game__header">
        <p className="qian-game__eyebrow">{t('eyebrow')}</p>
        <h2 id="lantern-title">{t('title')}</h2>
        <p>{t('tutorialIntro')}</p>
      </header>
      <LanternTutorial t={t} reduceMotion={reduceMotion} />
      <div className="qian-game__actions">
        <button className="task-button" type="button" onClick={() => setPhase('play')}>{t('startChallenge')}</button>
      </div>
    </section>
  }

  return <section className={`qian-game lantern-game${isComplete ? ' is-complete' : ''}`} aria-labelledby="lantern-title">
    <header className="qian-game__header">
      <p className="qian-game__eyebrow">{t('eyebrow')}</p>
      <h2 id="lantern-title">{t('title')}</h2>
      <p id="lantern-instructions">{t('instructions', { total })}</p>
    </header>

    <div className="qian-board lantern-board" role="group" aria-label={t('board', { size: GRID_SIZE })} aria-describedby="lantern-instructions"
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
      {board.map((lit, index) => <button key={index} type="button" className={`lantern${lit ? ' is-lit' : ''}${hintIndex === index ? ' is-hint' : ''}`}
        onClick={() => handleTap(index)} disabled={locked} aria-pressed={lit}
        aria-label={t('lantern', { position: index + 1, state: t(lit ? 'lit' : 'unlit') })}>
        <LanternIcon />
      </button>)}
    </div>

    <p className="qian-game__status" aria-live="polite">
      {isComplete ? t('complete') : t('progress', { lit: litCount, total, moves: moves.length })}
    </p>
    {!isComplete && <p className={`lantern-game__hint${lastDelta > 0 && hintLevel === 0 && hintIndex === null ? ' is-warning' : ''}`}>{guidance()}</p>}
    <div className="qian-game__actions">
      {!isComplete && <button className="task-button is-secondary" type="button" onClick={handleUndo} disabled={disabled || !moves.length}>{t('undo')}</button>}
      {!isComplete && <button className="task-button" type="button" onClick={handleHint} disabled={disabled || hintLevel === 2}>{hintLevel === 0 ? t('hintButton') : t('hintMore')}</button>}
      {isComplete && <button className="task-button is-secondary" type="button" onClick={() => reset(round + 1)}>{t('restart')}</button>}
    </div>
    {!isComplete && <button className="qian-game__link" type="button" onClick={() => setPhase('tutorial')}>{t('reviewTutorial')}</button>}
  </section>
}
