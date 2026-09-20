import { useEffect, useRef, useState } from 'react'
import { CalendarPlus, Check, Trash2 } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { useGame } from '../../state/GameContext.js'
import { isTempleInItinerary } from '../../state/gameRules.js'
import { useSettings } from '../../state/SettingsContext.js'
import './itinerary.css'

export default function ItineraryAction({ temple, completed }) {
  const { progress, session, addTempleToItinerary, removeTempleFromItinerary } = useGame()
  const { t } = useSettings()
  const location = useLocation()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const actionRef = useRef(null)
  const cancelRef = useRef(null)
  const joined = isTempleInItinerary(progress, temple.id)

  function closeConfirmation() {
    setConfirming(false)
    window.requestAnimationFrame(() => actionRef.current?.focus())
  }

  useEffect(() => {
    if (!confirming) return undefined
    cancelRef.current?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') closeConfirmation()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirming])

  function addTemple() {
    setError('')
    try {
      addTempleToItinerary(temple)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('itinerary.updateFailed'))
    }
  }

  function removeTemple() {
    setError('')
    try {
      removeTempleFromItinerary(temple.id)
      setConfirming(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('itinerary.updateFailed'))
    }
  }

  if (completed) return <div className="itinerary-action"><span className="itinerary-completed"><Check size={18} />{t('itinerary.completed')}</span></div>

  if (session.status !== 'ready') {
    const next = `${location.pathname}${location.search}`
    return <div className="itinerary-action"><Link className="task-button is-secondary itinerary-login" to={`${ROUTES.entry}?next=${encodeURIComponent(next)}`}><CalendarPlus size={18} />{t('itinerary.loginToAdd')}</Link></div>
  }

  return <div className="itinerary-action">
    <button ref={actionRef} type="button" className={`task-button itinerary-add${joined ? ' is-joined' : ''}`} aria-pressed={joined} onClick={joined ? () => setConfirming(true) : addTemple}>
      {joined ? <Check size={18} /> : <CalendarPlus size={18} />}{t(joined ? 'itinerary.joined' : 'itinerary.add')}
    </button>
    {confirming && <div className="itinerary-confirm" role="alertdialog" aria-labelledby="itinerary-confirm-title">
      <p id="itinerary-confirm-title">{t('itinerary.removeConfirm')}</p>
      <div>
        <button ref={cancelRef} type="button" onClick={closeConfirmation}>{t('itinerary.cancel')}</button>
        <button type="button" className="is-remove" onClick={removeTemple}><Trash2 size={16} />{t('itinerary.remove')}</button>
      </div>
    </div>}
    {error && <p className="itinerary-action-error" role="alert">{error}</p>}
  </div>
}
