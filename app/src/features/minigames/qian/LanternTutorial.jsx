import { useEffect, useState } from 'react'
import { createSolvedBoard, DEFAULT_SCRAMBLE_MOVES, toggleLantern } from './lanternRules.js'
import LanternIcon from './LanternIcon.jsx'

// 自動播放的示範：假設玩家第一次玩。四段循環，每段先移動手指、再翻轉、再停留讓玩家讀說明。
const SOLVED = createSolvedBoard()
// 示範關卡與正式挑戰同樣被亂點 DEFAULT_SCRAMBLE_MOVES 下，但用固定的格子，讓玩家對照流程而不是抄答案。
const DEMO_SCRAMBLE = [1, 3, 8].slice(0, DEFAULT_SCRAMBLE_MOVES)
const SCRAMBLED = DEMO_SCRAMBLE.reduce((board, index) => toggleLantern(board, index), SOLVED)
const solveSteps = DEMO_SCRAMBLE.map((cell, order) => {
  const board = DEMO_SCRAMBLE.slice(0, order).reduce((current, index) => toggleLantern(current, index), SCRAMBLED)
  return { key: `tutorialSolve${order + 1}`, board, pointer: cell, tap: cell }
})
const STEPS = [
  { key: 'tutorial1', board: SOLVED, pointer: null },
  { key: 'tutorial2', board: SOLVED, pointer: 4, tap: 4 },
  { key: 'tutorial3', board: toggleLantern(SOLVED, 4), pointer: 4, tap: 4 },
  { key: 'tutorial4', board: SCRAMBLED, pointer: null },
  ...solveSteps,
  { key: 'tutorialDone', board: SOLVED, pointer: null, done: true },
]
const POINT_MS = 900   // 手指移到位置
const HOLD_MS = 2200   // 翻轉後停留讀說明

export default function LanternTutorial({ t, reduceMotion }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [tapped, setTapped] = useState(false) // 這一段的點擊是否已發生
  const step = STEPS[stepIndex]
  const board = step.tap !== undefined && tapped ? toggleLantern(step.board, step.tap) : step.board

  useEffect(() => {
    if (reduceMotion) return undefined
    const hasTap = step.tap !== undefined
    const timer = setTimeout(() => {
      if (hasTap && !tapped) { setTapped(true); return }
      setTapped(false)
      setStepIndex(index => (index + 1) % STEPS.length)
    }, hasTap && !tapped ? POINT_MS : HOLD_MS)
    return () => clearTimeout(timer)
  }, [stepIndex, tapped, step.tap, reduceMotion])

  // 減少動畫時改成手動翻頁。
  function goTo(index) { setTapped(false); setStepIndex((index + STEPS.length) % STEPS.length) }

  return <div className={`lantern-tutorial${step.done ? ' is-complete' : ''}`}>
    <div className="qian-board lantern-board lantern-board--demo" aria-hidden="true">
      {board.map((lit, index) => <span key={index} className={`lantern${lit ? ' is-lit' : ''}${step.tap === index && tapped ? ' is-tapped' : ''}`}><LanternIcon /></span>)}
      {step.pointer !== null && <span className={`tutorial-pointer${tapped ? ' is-down' : ''}`} style={{ '--col': step.pointer % 3, '--row': Math.floor(step.pointer / 3) }}>👆</span>}
    </div>
    <p className="lantern-tutorial__text" aria-live="polite">
      <span className="lantern-tutorial__step">{stepIndex + 1}／{STEPS.length}</span>{t(step.key, { moves: DEFAULT_SCRAMBLE_MOVES })}
    </p>
    <div className="lantern-tutorial__nav">
      <button type="button" className="qian-game__link" onClick={() => goTo(stepIndex - 1)}>{t('tutorialPrev')}</button>
      <button type="button" className="qian-game__link" onClick={() => goTo(stepIndex + 1)}>{t('tutorialNext')}</button>
    </div>
  </div>
}
