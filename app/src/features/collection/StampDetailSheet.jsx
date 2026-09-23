import { useEffect, useRef } from 'react'
import { CalendarDays, Check, ExternalLink, LockKeyhole, MapPin, X } from 'lucide-react'
import { Link } from 'react-router'
import { formatStampDate } from './stampBookData.js'
import { useSettings } from '../../state/SettingsContext.js'

export default function StampDetailSheet({ entry, onClose }) {
  const { language, t } = useSettings()
  const closeRef = useRef(null)
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    function handleKeyDown(event) { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const date = formatStampDate(entry.collectedAt, language)
  return <div className="stamp-sheet-layer" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="stamp-sheet" role="dialog" aria-modal="true" aria-labelledby="stamp-sheet-title">
      <span className="stamp-sheet-handle" aria-hidden="true" />
      <button ref={closeRef} className="stamp-sheet-close" type="button" onClick={onClose} aria-label={t('stampbook.closeDetail')} title={t('common.close')}><X size={21} /></button>
      <div className={`stamp-sheet-image${entry.collected ? '' : ' is-locked'}`}>
        {entry.collected && entry.stampImage
          ? <img src={entry.stampImage} alt={t('stampbook.stampAlt', { temple: entry.templeName })} />
          : <span className="stamp-sheet-unknown" aria-label={t('stampbook.unknown')}>?</span>}
      </div>
      <div className="stamp-sheet-copy">
        <p className="stamp-sheet-kicker">{t('stampbook.exclusive')}</p>
        <h2 id="stamp-sheet-title">{entry.templeName}</h2>
        <p className="stamp-sheet-location"><MapPin size={16} />{entry.locationLabel}</p>
        {entry.collected
          ? <><p className="stamp-sheet-state is-collected"><Check size={16} />{t('stampbook.collected')}</p>{date && <p className="stamp-sheet-date"><CalendarDays size={16} />{t('stampbook.acquiredDate', { date })}</p>}<p className="stamp-sheet-description">{t('stampbook.acquiredDescription', { temple: entry.templeName })}</p></>
          : <><p className="stamp-sheet-state is-locked"><LockKeyhole size={16} />{t('stampbook.notCollected')}</p><p className="stamp-sheet-description">{t('stampbook.lockedDescription')}</p></>}
        <div className="stamp-sheet-actions">
          <Link className="stamp-sheet-primary" to={entry.templeRoute}><ExternalLink size={17} />{t('stampbook.viewTemple')}</Link>
          {entry.collected && entry.journalRoute && <Link className="stamp-sheet-secondary" to={entry.journalRoute}>{t('stampbook.viewJournal')}</Link>}
        </div>
      </div>
    </section>
  </div>
}
