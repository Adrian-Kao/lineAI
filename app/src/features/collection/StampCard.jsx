import { Check } from 'lucide-react'

export default function StampCard({ entry, onSelect }) {
  return <button className={`stamp-card${entry.collected ? ' is-collected' : ' is-locked'}`} type="button" onClick={event => onSelect(entry, event.currentTarget)} aria-label={`${entry.templeName}，${entry.locationLabel}，${entry.collected ? '已收藏' : '尚未取得'}`}>
    <span className="stamp-card-image" aria-hidden="true">
      {entry.collected && entry.stampImage
        ? <img src={entry.stampImage} alt="" />
        : <span className="stamp-card-unknown">?</span>}
    </span>
    <strong>{entry.templeName}</strong>
    <span className="stamp-status">{entry.collected ? <><Check size={14} />已收藏</> : <>尚未取得</>}</span>
  </button>
}
