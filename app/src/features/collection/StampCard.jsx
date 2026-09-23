import { Check } from 'lucide-react'
import { useSettings } from '../../state/SettingsContext.js'

export default function StampCard({ entry, onSelect }) {
  const { t } = useSettings()
  const state = t(entry.collected ? 'stampbook.collected' : 'stampbook.notCollected')
  return <button className={`stamp-card${entry.collected ? ' is-collected' : ' is-locked'}`} type="button" onClick={event => onSelect(entry, event.currentTarget)} aria-label={t('stampbook.cardLabel', { temple: entry.templeName, location: entry.locationLabel, state })}>
    <span className="stamp-card-image" aria-hidden="true">
      {entry.collected && entry.stampImage
        ? <img src={entry.stampImage} alt="" />
        : <span className="stamp-card-unknown">?</span>}
    </span>
    <strong>{entry.templeName}</strong>
    <span className="stamp-status">{entry.collected ? <><Check size={14} />{state}</> : <>{state}</>}</span>
  </button>
}
