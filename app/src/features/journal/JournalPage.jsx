import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '../../state/SettingsContext.js'
import { localizeJournalEntries, sortJournalEntries, JOURNAL_ENTRIES } from './journalData.js'
import JournalClosedView from './JournalClosedView.jsx'
import JournalOpenView from './JournalOpenView.jsx'
import './journal.css'

const ZOOMING_MS = 1600
const PAGE_TURN_FALLBACK_MS = 720

export default function JournalPage() {
  const { language, reduceMotion } = useSettings()
  const entries = useMemo(() => sortJournalEntries(localizeJournalEntries(JOURNAL_ENTRIES, language)), [language])
  const [phase, setPhase] = useState('closed')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageTurn, setPageTurn] = useState(null)
  const pageTurnRef = useRef(null)
  const pageTurnSequenceRef = useRef(0)
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

  const finishPageTurn = useCallback(sequence => {
    const currentTurn = pageTurnRef.current
    if (!currentTurn || (sequence != null && sequence !== currentTurn.sequence)) return
    pageTurnRef.current = null
    setPageIndex(currentTurn.nextIndex)
    setPageTurn(null)
  }, [])

  const turnPage = useCallback(direction => {
    if (phase !== 'open') return
    const activeIndex = pageTurn?.nextIndex ?? pageIndex
    const nextIndex = activeIndex + (direction === 'next' ? 1 : -1)
    if (nextIndex < 0 || nextIndex >= entries.length) return
    if (reduceMotion) {
      pageTurnRef.current = null
      setPageIndex(nextIndex)
      setPageTurn(null)
      return
    }
    if (pageTurn) setPageIndex(activeIndex)
    pageTurnSequenceRef.current += 1
    const nextTurn = { direction, nextIndex, sequence: pageTurnSequenceRef.current }
    pageTurnRef.current = nextTurn
    setPageTurn(nextTurn)
  }, [entries.length, pageIndex, pageTurn, phase, reduceMotion])

  useEffect(() => {
    if (!pageTurn) return undefined
    const sequence = pageTurn.sequence
    const fallback = window.setTimeout(() => finishPageTurn(sequence), PAGE_TURN_FALLBACK_MS)
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
      : <JournalOpenView entries={entries} pageIndex={pageIndex} navigationIndex={pageTurn?.nextIndex ?? pageIndex} turn={pageTurn} onTurn={turnPage} onTurnComplete={finishPageTurn} onClose={closeJournal} />}
  </main>
}
