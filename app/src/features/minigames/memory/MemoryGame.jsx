import { useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '../../../state/SettingsContext.js'
import { ARTIFACT_IDS, countMoves, createDeck, createState, DEFAULT_PAIRS, flipCard, hideMismatch, isSolved } from './memoryRules.js'
import { createTranslator } from './memoryMessages.js'
import ArtifactIcon from './ArtifactIcon.jsx'
import './memoryGame.css'

// 方案 A：與拼圖共用主線第三格的 taskId，玩法由 evidence.kind 區分。
export const MEMORY_TASK_ID = 'puzzle'
const MISMATCH_MS = 900

/**
 * 文物翻牌配對：4×4 共 8 對。完成由配對狀態決定並回報 evidence，與拼圖相同的 onComplete 介面。
 *
 * @param {{ seed?: string | number, pairs?: number, onComplete?: (result: object) => void, disabled?: boolean }} props
 */
export default function MemoryGame({ seed, pairs = DEFAULT_PAIRS, onComplete, disabled = false }) {
  const { language, reduceMotion } = useSettings()
  const t = useMemo(() => createTranslator(language), [language])
  const [round, setRound] = useState(0)
  const [state, setState] = useState(() => createState(createDeck({ seed: seed ?? `memory-${round}`, pairs })))
  const [isComplete, setIsComplete] = useState(false)
  const hasReported = useRef(false)
  const timerRef = useRef(null)
  const moves = countMoves(state.flips)
  const matchedPairs = state.matched.length / 2
  const legendIds = ARTIFACT_IDS.slice(0, pairs)
  const matchedIds = new Set(state.matched.map(index => state.deck[index]))

  // 不配對的兩張停留一下再蓋回；減少動畫時縮短。
  useEffect(() => {
    if (!state.mismatched) return undefined
    timerRef.current = setTimeout(() => setState(hideMismatch), reduceMotion ? 300 : MISMATCH_MS)
    return () => clearTimeout(timerRef.current)
  }, [state.mismatched, reduceMotion])

  function handleFlip(index) {
    if (isComplete || disabled) return
    const next = flipCard(state, index)
    if (next === state) return
    setState(next)
    if (!isSolved(next) || hasReported.current) return
    hasReported.current = true
    setIsComplete(true)
    onComplete?.({
      taskId: MEMORY_TASK_ID,
      completedAt: new Date().toISOString(),
      evidence: { kind: 'memory', pairs, deck: next.deck, flips: next.flips },
    })
  }

  function handleRestart() {
    hasReported.current = false
    const nextRound = round + 1
    setRound(nextRound)
    setState(createState(createDeck({ seed: seed ?? `memory-${nextRound}`, pairs })))
    setIsComplete(false)
  }

  function cardState(index) {
    if (state.matched.includes(index)) return t('matchedState', { name: t(`artifact.${state.deck[index]}`) })
    if (state.faceUp.includes(index)) return t('faceUpState', { name: t(`artifact.${state.deck[index]}`) })
    return t('faceDown')
  }

  return <section className={`qian-game memory-game${isComplete ? ' is-complete' : ''}`} aria-labelledby="memory-title">
    <header className="qian-game__header">
      <p className="qian-game__eyebrow">{t('eyebrow')}</p>
      <h2 id="memory-title">{t('title')}</h2>
      <p id="memory-instructions">{t('instructions', { pairs })}</p>
    </header>

    <ul className="memory-legend" aria-label={t('legend', { pairs })}>
      {legendIds.map(id => <li key={id} className={`memory-legend__item${matchedIds.has(id) ? ' is-found' : ''}`}>
        <ArtifactIcon id={id} />
        <span>{t(`artifact.${id}`)}</span>
        <span className="sr-only">{matchedIds.has(id) ? t('legendFound') : ''}</span>
      </li>)}
    </ul>

    <div className="qian-board memory-board" role="group" aria-label={t('board', { pairs })} aria-describedby="memory-instructions">
      {state.deck.map((id, index) => {
        const matched = state.matched.includes(index)
        const faceUp = matched || state.faceUp.includes(index)
        return <button key={index} type="button" className={`memory-card${faceUp ? ' is-face-up' : ''}${matched ? ' is-matched' : ''}${state.mismatched && state.faceUp.includes(index) ? ' is-mismatch' : ''}`}
          onClick={() => handleFlip(index)} disabled={isComplete || disabled || matched} aria-pressed={faceUp}
          aria-label={t('card', { position: index + 1, state: cardState(index) })}>
          <span className="memory-card__inner">
            <span className="memory-card__face memory-card__back" aria-hidden="true">福</span>
            <span className="memory-card__face memory-card__front" aria-hidden="true">
              <ArtifactIcon id={id} />
              <span className="memory-card__name">{t(`artifact.${id}`)}</span>
            </span>
          </span>
        </button>
      })}
    </div>

    <p className="qian-game__status" aria-live="polite">
      {isComplete
        ? t(moves === pairs ? 'perfect' : 'complete', { moves })
        : state.mismatched ? t('mismatch') : t('progress', { matched: matchedPairs, pairs, moves })}
    </p>
    {isComplete && <div className="qian-game__actions"><button className="task-button is-secondary" type="button" onClick={handleRestart}>{t('restart')}</button></div>}
  </section>
}
