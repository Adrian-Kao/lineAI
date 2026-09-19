import { useEffect } from 'react'
import { Link } from 'react-router'
import { X } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { missionEnabledTempleIds } from '../../data/templeContent.js'
import TempleArtwork from './TempleArtwork.jsx'

export default function TemplePreviewCard({ temple, onClose, style, detailState }) {
  useEffect(() => {
    const handleKey = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const description = `位於${temple.county}的${temple.religion}寺廟${temple.deity ? `，主祀${temple.deity}` : ''}。`
  return <section className="temple-preview" aria-label="宮廟簡介" style={style}>
    <button type="button" className="preview-close" aria-label="關閉宮廟簡介" title="關閉" onClick={onClose}><X size={19} /></button>
    <TempleArtwork />
    <div className="preview-body">
      <h2>{temple.name}</h2>
      <p className="temple-religion">{temple.religion}</p>
      <p>{description}</p>
      {temple.address && <p className="temple-address">{temple.address}</p>}
      <div className="preview-links">
        <Link className="task-button is-secondary" to={ROUTES.templeDetail.replace(':county', encodeURIComponent(temple.county)).replace(':uuid', temple.id)} state={detailState}>查看詳情</Link>
        {missionEnabledTempleIds.has(temple.id) && <Link className="task-button" to={ROUTES.temple}>探索任務</Link>}
      </div>
    </div>
  </section>
}
