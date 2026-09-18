import { useEffect } from 'react'
import { Link } from 'react-router'
import { X } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import TempleArtwork from './TempleArtwork.jsx'

export default function TemplePreviewCard({ temple, onClose, returnView, returnDistrictId, style }) {
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
      <Link className="temple-detail-link" to={ROUTES.templeDetail.replace(':county', encodeURIComponent(temple.county)).replace(':uuid', encodeURIComponent(temple.id))} state={{ returnView, returnDistrictId }}>查看完整介紹</Link>
    </div>
  </section>
}
