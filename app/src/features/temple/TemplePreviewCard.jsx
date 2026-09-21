import { useEffect } from 'react'
import { Link } from 'react-router'
import { X } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { missionEnabledTempleIds, templeContentById } from '../../data/templeContent.js'
import TempleArtwork from './TempleArtwork.jsx'
import { useSettings } from '../../state/SettingsContext.js'
import { buildTempleDescription, localizeReligion, localizeTempleName } from '../../utils/templeLocalization.js'

export default function TemplePreviewCard({ temple, onClose, style, detailState }) {
  const { language, t } = useSettings()
  useEffect(() => {
    const handleKey = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const content = templeContentById[temple.id]
  const name = localizeTempleName(temple, content, language)
  const description = buildTempleDescription(temple, language, content)
  return <section className="temple-preview" aria-label={t('temple.preview')} style={style}>
    <button type="button" className="preview-close" aria-label={t('temple.closePreview')} title={t('common.close')} onClick={onClose}><X size={19} /></button>
    <TempleArtwork />
    <div className="preview-body">
      <h2>{name}</h2>
      <p className="temple-religion">{localizeReligion(temple.religion, language, content)}</p>
      <p>{description}</p>
      {temple.address && <p className="temple-address">{temple.address}</p>}
      <div className="preview-links">
        <Link className="task-button is-secondary" to={ROUTES.templeDetail.replace(':county', encodeURIComponent(temple.county)).replace(':uuid', temple.id)} state={detailState}>{t('temple.details')}</Link>
        {missionEnabledTempleIds.has(temple.id) && <Link className="task-button" to={ROUTES.temple}>{t('temple.explore')}</Link>}
      </div>
    </div>
  </section>
}
