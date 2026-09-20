import StampCard from './StampCard.jsx'

export default function StampGrid({ entries, onSelect }) {
  if (!entries.length) return <div className="stamp-grid-empty" role="status"><strong>沒有符合條件的印章</strong><span>調整收藏狀態或縣市篩選後再看看。</span></div>
  return <div className="stamp-grid" aria-label="宮廟印章收藏">
    {entries.map(entry => <StampCard key={entry.templeId} entry={entry} onSelect={onSelect} />)}
  </div>
}
