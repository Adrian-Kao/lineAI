import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import JournalBook from './JournalBook.jsx'
import { useSettings } from '../../state/SettingsContext.js'

export default function JournalOpenView({ entries, pageIndex, navigationIndex, turn, onTurn, onTurnComplete, onClose }) {
  const { t } = useSettings()
  const entry = entries[pageIndex]
  return <section className="journal-open-view" aria-label={t('journal.openAria')}>
    <header className="journal-reader-header">
      <div><p>{t('journal.eyebrow')}</p><h1>{t('journal.title')}</h1></div>
      <button type="button" className="journal-icon-button" onClick={onClose} aria-label={t('journal.close')} title={t('journal.close')}><X size={22} /></button>
    </header>

    {entry
      ? <JournalBook entry={entry} turn={turn} onTurnComplete={onTurnComplete} />
      : <div className="journal-empty"><h2>{t('journal.emptyTitle')}</h2><p>{t('journal.emptyBody')}</p></div>}

    {entry && <nav className="journal-page-controls" aria-label={t('journal.pagination')}>
      <button type="button" className="journal-icon-button" onClick={() => onTurn('previous')} disabled={navigationIndex === 0} aria-label={t('journal.previous')}><ChevronLeft size={24} /></button>
      <div className="journal-page-dots" aria-label={t('journal.pageStatus', { current: pageIndex + 1, total: entries.length })}>
        {entries.map((item, index) => <span key={item.id} className={index === pageIndex ? 'is-current' : ''} />)}
      </div>
      <button type="button" className="journal-icon-button" onClick={() => onTurn('next')} disabled={navigationIndex === entries.length - 1} aria-label={t('journal.next')}><ChevronRight size={24} /></button>
    </nav>}
  </section>
}
