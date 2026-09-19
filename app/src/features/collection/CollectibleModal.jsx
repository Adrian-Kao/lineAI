import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function CollectibleModal({ item, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!item) return undefined
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = event => { if (event.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [item, onClose])

  if (!item) return null
  return createPortal(<div className="collectible-modal-layer" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="collectible-modal" role="dialog" aria-modal="true" aria-labelledby="collectible-modal-title">
      <button ref={closeRef} className="collectible-modal-close" type="button" onClick={onClose} aria-label="關閉收藏介紹"><X size={22} /></button>
      <div className={`collectible-modal-media${item.kind === 'stamp' ? ' is-stamp' : ''}`}>
        <img src={item.imageUrl} alt={item.imageAlt} />
      </div>
      <div className="collectible-modal-copy">
        <p className="collectible-modal-kicker">{item.location}</p>
        <h2 id="collectible-modal-title">{item.title}</h2>
        {item.date && <p className="collectible-modal-date">取得日期・{item.date}</p>}
        {item.description && <p className="collectible-modal-description">{item.description}</p>}
        {item.sourceNote && <p className="collectible-modal-source">{item.sourceNote}</p>}
      </div>
    </section>
  </div>, document.body)
}
