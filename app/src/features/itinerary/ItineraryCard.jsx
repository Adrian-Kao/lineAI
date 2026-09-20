import { MapPin, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { templeContentById } from '../../data/templeContent.js'
import { useSettings } from '../../state/SettingsContext.js'
import { localizeDeity, localizeTempleName } from '../../utils/templeLocalization.js'
import TempleArtwork from '../temple/TempleArtwork.jsx'

function detailRoute(item) {
  return ROUTES.templeDetail
    .replace(':county', encodeURIComponent(item.county))
    .replace(':uuid', item.templeId)
}

export default function ItineraryCard({ item, temple, onRemove }) {
  const { language, t } = useSettings()

  if (!temple) return <article className="itinerary-card is-missing">
    <div className="itinerary-card__missing"><MapPin size={26} /><div><h2>{t('itinerary.unavailable')}</h2><p>{item.county}</p></div></div>
    <button type="button" className="itinerary-remove" onClick={() => onRemove(item.templeId)}><Trash2 size={16} />{t('itinerary.remove')}</button>
  </article>

  const content = templeContentById[temple.id]
  const name = localizeTempleName(temple, content, language)
  return <article className="itinerary-card">
    <div className="itinerary-card__media">
      {content?.image ? <img src={content.image} alt="" /> : <TempleArtwork />}
    </div>
    <div className="itinerary-card__body">
      <h2>{name}</h2>
      <p className="itinerary-card__location"><MapPin size={15} />{temple.address || temple.county}</p>
      {temple.deity && <p>{t('itinerary.deity', { deity: localizeDeity(temple.deity, language, content) })}</p>}
      <div className="itinerary-card__actions">
        <Link className="task-button" to={detailRoute(item)} state={{ fromItinerary: true }}>{t('itinerary.viewTemple')}</Link>
        <button type="button" className="itinerary-remove" onClick={() => onRemove(item.templeId)}><Trash2 size={16} />{t('itinerary.remove')}</button>
      </div>
    </div>
  </article>
}
