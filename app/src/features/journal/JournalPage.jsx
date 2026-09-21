import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '../../state/SettingsContext.js'
import { sortJournalEntries, JOURNAL_ENTRIES } from './journalData.js'
import JournalClosedView from './JournalClosedView.jsx'
import JournalOpenView from './JournalOpenView.jsx'
import './journal.css'

const ZOOMING_MS = 1600
const PAGE_TURN_FALLBACK_MS = 800

export default function JournalPage() {
  const { reduceMotion } = useSettings()
  const entries = useMemo(() => sortJournalEntries(JOURNAL_ENTRIES), [])
  const [phase, setPhase] = useState('closed')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageTurn, setPageTurn] = useState(null)
  const timersRef = useRef([])

  const schedule = useCallback((callback, delay) => {
    const timer = window.setTimeout(callback, delay)
    timersRef.current.push(timer)
  }, [])

  useEffect(() => () => timersRef.current.forEach(window.clearTimeout), [])

  useEffect(() => {
    entries.forEach(entry => {
      const image = new Image()
      image.decoding = 'async'
      image.src = entry.photo
      image.decode?.().catch(() => {})
    })
  }, [entries])

  const openJournal = useCallback(() => {
    if (phase !== 'closed') return
    setPhase('zooming')
    schedule(() => setPhase('open'), reduceMotion ? 20 : ZOOMING_MS)
  }, [phase, reduceMotion, schedule])

  const closeJournal = useCallback(() => {
    if (phase !== 'open' || pageTurn) return
    setPhase('closed')
  }, [pageTurn, phase])

  const finishPageTurn = useCallback(() => {
    if (!pageTurn) return
    setPageIndex(pageTurn.nextIndex)
    setPageTurn(null)
  }, [pageTurn])

  const turnPage = useCallback(direction => {
    if (phase !== 'open' || pageTurn) return
    const nextIndex = pageIndex + (direction === 'next' ? 1 : -1)
    if (nextIndex < 0 || nextIndex >= entries.length) return
    if (reduceMotion) {
      setPageIndex(nextIndex)
      return
    }
    setPageTurn({ direction, nextIndex })
  }, [entries.length, pageIndex, pageTurn, phase, reduceMotion])

  useEffect(() => {
    if (!pageTurn) return undefined
    const fallback = window.setTimeout(finishPageTurn, PAGE_TURN_FALLBACK_MS)
    return () => window.clearTimeout(fallback)
  }, [finishPageTurn, pageTurn])

  useEffect(() => {
    if (phase !== 'open') return undefined
    function handleKeyDown(event) {
      if (event.key === 'ArrowRight') turnPage('next')
      if (event.key === 'ArrowLeft') turnPage('previous')
      if (event.key === 'Escape') closeJournal()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeJournal, phase, turnPage])

  return <main className={`journal-page is-${phase}`}>
    {phase === 'closed' || phase === 'zooming'
      ? <JournalClosedView phase={phase} onOpen={openJournal} />
      : <JournalOpenView entries={entries} pageIndex={pageIndex} turnDirection={pageTurn?.direction ?? null} onTurn={turnPage} onTurnComplete={finishPageTurn} onClose={closeJournal} />}
  </main>
}
