import JournalPageCard from './JournalPageCard.jsx'

export default function JournalBook({ entry, turn, onTurnComplete }) {
  return <div className={`journal-book-stage${turn ? ` is-turning-${turn.direction}` : ''}`}>
    <div className="journal-book">
      <JournalPageCard entry={entry} />
      <div className="journal-binding" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
      {turn && <div key={turn.sequence} className="journal-turn-leaf" aria-hidden="true" onAnimationEnd={event => { if (event.target === event.currentTarget) onTurnComplete(turn.sequence) }}><span /><span /></div>}
    </div>
  </div>
}
