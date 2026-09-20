import JournalPageCard from './JournalPageCard.jsx'

export default function JournalBook({ entry, turnDirection }) {
  return <div className={`journal-book-stage${turnDirection ? ` is-turning-${turnDirection}` : ''}`}>
    <div className="journal-book">
      <JournalPageCard entry={entry} />
      <div className="journal-binding" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
      {turnDirection && <div className="journal-turn-leaf" aria-hidden="true"><span /><span /></div>}
    </div>
  </div>
}
