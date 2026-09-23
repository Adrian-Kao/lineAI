import { Leaf, MapPin, PenLine } from 'lucide-react'
import { useSettings } from '../../state/SettingsContext.js'

function formatVisitDate(value, language) {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
}

export default function JournalPageCard({ entry }) {
  const { language, t } = useSettings()
  const photoStyle = { backgroundImage: `url(${entry.photo})`, backgroundPosition: entry.photoPosition, backgroundSize: entry.photoSize }
  return <article className="journal-entry" aria-labelledby={`journal-entry-${entry.id}`}>
    <section className="journal-sheet is-photo-page">
      <span className="journal-tape" aria-hidden="true" />
      <header className="journal-entry-heading">
        <p><MapPin size={15} />{entry.location}</p>
        <h2 id={`journal-entry-${entry.id}`}>{entry.templeName}</h2>
        <span>{entry.subtitle}</span>
      </header>
      <figure className="journal-polaroid">
        <div className="journal-photo" role="img" aria-label={t('journal.photoAlt', { temple: entry.templeName })} style={photoStyle} />
        <figcaption>{t('journal.photoCaption', { date: formatVisitDate(entry.visitedAt, language) })}</figcaption>
      </figure>
      <Leaf className="journal-leaf-mark" size={58} strokeWidth={1.25} aria-hidden="true" />
    </section>

    <section className="journal-sheet is-memory-page">
      <p className="journal-section-label">{t('journal.section')}</p>
      <h3>{t('journal.intro')}</h3>
      <p className="journal-summary">{entry.summary}</p>
      <div className="journal-memory-row">
        <div className={`journal-stamp${entry.stamp.image ? ' is-image' : ''}`} aria-label={t('journal.stampAlt', { temple: entry.templeName })}>
          {entry.stamp.image
            ? <img src={entry.stamp.image} alt="" aria-hidden="true" />
            : <><span>{entry.stamp.title}</span><strong>{entry.stamp.place}</strong></>}
        </div>
        <section className="journal-personal-note">
          <h3><PenLine size={18} />{t('journal.note')}</h3>
          <p>{entry.personalNote}</p>
        </section>
      </div>
      
    </section>
  </article>
}
