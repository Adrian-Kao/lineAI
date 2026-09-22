import { Leaf, MapPin, PenLine } from 'lucide-react'

function formatVisitDate(value) {
  return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
}

export default function JournalPageCard({ entry }) {
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
        <div className="journal-photo" role="img" aria-label={`${entry.templeName}參訪照片`} style={photoStyle} />
        <figcaption>{formatVisitDate(entry.visitedAt)}・參訪留影</figcaption>
      </figure>
      <Leaf className="journal-leaf-mark" size={58} strokeWidth={1.25} aria-hidden="true" />
    </section>

    <section className="journal-sheet is-memory-page">
      <p className="journal-section-label">宮廟小記</p>
      <h3>寺廟簡介</h3>
      <p className="journal-summary">{entry.summary}</p>
      <div className="journal-memory-row">
        <div className={`journal-stamp${entry.stamp.image ? ' is-image' : ''}`} aria-label={`${entry.templeName}紀念印章`}>
          {entry.stamp.image
            ? <img src={entry.stamp.image} alt="" aria-hidden="true" />
            : <><span>{entry.stamp.title}</span><strong>{entry.stamp.place}</strong></>}
        </div>
        <section className="journal-personal-note">
          <h3><PenLine size={18} />我的小記錄</h3>
          <p>{entry.personalNote}</p>
        </section>
      </div>
      
    </section>
  </article>
}
