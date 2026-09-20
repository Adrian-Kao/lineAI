import ItineraryCard from './ItineraryCard.jsx'

export default function ItineraryList({ records, onRemove }) {
  return <div className="itinerary-list">
    {records.map(record => <ItineraryCard key={record.item.templeId} item={record.item} temple={record.temple} onRemove={onRemove} />)}
  </div>
}
