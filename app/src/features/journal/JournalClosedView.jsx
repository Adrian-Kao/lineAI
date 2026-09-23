import { useSettings } from '../../state/SettingsContext.js'

export default function JournalClosedView({ phase, onOpen }) {
  const { t } = useSettings()
  return <section className={`journal-closed-view is-${phase}`} aria-label={t('journal.coverAria')}>
    <button className="journal-scene" type="button" onClick={onOpen} disabled={phase === 'zooming'} aria-label={t('journal.open')}>
      <img className="journal-desk-layer" src="/journal/journal-desk.png" alt="" aria-hidden="true" />
      <span className="journal-book-object">
        <span className="journal-opening-pages" aria-hidden="true">
          <span className="journal-opening-sheet is-left" />
          <span className="journal-opening-sheet is-right" />
          <span className="journal-opening-binding" />
        </span>
        <img className="journal-cover-object" src="/journal/journal-notebook-cutout.png" alt={t('journal.coverAlt')} />
      </span>
      <span className="journal-cover-title"><small>{t('journal.coverEyebrow')}</small>{t('journal.coverTitle')}</span>
    </button>
  </section>
}
