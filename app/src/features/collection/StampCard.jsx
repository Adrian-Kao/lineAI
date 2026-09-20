import { Check, LockKeyhole, MapPin } from 'lucide-react'

export default function StampCard({ entry, onSelect }) {
  return <button className={`stamp-card${entry.collected ? ' is-collected' : ' is-locked'}`} type="button" onClick={event => onSelect(entry, event.currentTarget)} aria-label={`${entry.templeName}，${entry.locationLabel}，${entry.collected ? '已收藏' : '尚未取得'}`}>
    <span className="stamp-card-image" aria-hidden="true">
      <img src={entry.stampImage} alt="" />
      {!entry.collected && <span className="stamp-lock"><LockKeyhole size={16} /></span>}
    </span>
    <strong>{entry.templeName}</strong>
    <span className="stamp-location"><MapPin size={13} />{entry.locationLabel}</span>
    <span className="stamp-status">{entry.collected ? <><Check size={14} />已收藏</> : <>尚未取得</>}</span>
  </button>
}
