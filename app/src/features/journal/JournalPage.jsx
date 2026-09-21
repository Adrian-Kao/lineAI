import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '../../state/SettingsContext.js'
import { sortJournalEntries, JOURNAL_ENTRIES } from './journalData.js'
import JournalClosedView from './JournalClosedView.jsx'
import JournalOpenView from './JournalOpenView.jsx'
import './journal.css'

const ZOOMING_MS = 1600
const PAGE_TURN_MS = 680

export default function JournalPage() {
  const { reduceMotion } = useSettings()
  const entries = useMemo(() => sortJournalEntries(JOURNAL_ENTRIES), [])
  const [phase, setPhase] = useState('closed')
  const [pageIndex, setPageIndex] = useState(0)
  const [turnDirection, setTurnDirection] = useState(null)
  const timersRef = useRef([])

  const schedule = useCallback((callback, delay) => {
    const timer = window.setTimeout(callback, delay)
    timersRef.current.push(timer)
  }, [])

  useEffect(() => () => timersRef.current.forEach(window.clearTimeout), [])

  const openJournal = useCallback(() => {
    if (phase !== 'closed') return
    setPhase('zooming')
    schedule(() => setPhase('open'), reduceMotion ? 20 : ZOOMING_MS)
  }, [phase, reduceMotion, schedule])

  const closeJournal = useCallback(() => {
    if (phase !== 'open' || turnDirection) return
    setPhase('closed')
  }, [phase, turnDirection])

  const turnPage = useCallback(direction => {
    if (phase !== 'open' || turnDirection) return
    const nextIndex = pageIndex + (direction === 'next' ? 1 : -1)
    if (nextIndex < 0 || nextIndex >= entries.length) return
    if (reduceMotion) {
      setPageIndex(nextIndex)
      return
    }
    setTurnDirection(direction)
    schedule(() => setPageIndex(nextIndex), PAGE_TURN_MS / 2)
    schedule(() => setTurnDirection(null), PAGE_TURN_MS)
  }, [entries.length, pageIndex, phase, reduceMotion, schedule, turnDirection])

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
      : <JournalOpenView entries={entries} pageIndex={pageIndex} turnDirection={turnDirection} onTurn={turnPage} onClose={closeJournal} />}
  </main>
}
