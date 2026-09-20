import { useEffect, useRef } from 'react'
import { CalendarDays, Check, ExternalLink, LockKeyhole, MapPin, X } from 'lucide-react'
import { Link } from 'react-router'
import { formatStampDate } from './stampBookData.js'

export default function StampDetailSheet({ entry, onClose }) {
  const closeRef = useRef(null)
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    function handleKeyDown(event) { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const date = formatStampDate(entry.collectedAt)
  return <div className="stamp-sheet-layer" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="stamp-sheet" role="dialog" aria-modal="true" aria-labelledby="stamp-sheet-title">
      <span className="stamp-sheet-handle" aria-hidden="true" />
      <button ref={closeRef} className="stamp-sheet-close" type="button" onClick={onClose} aria-label="關閉印章詳情" title="關閉"><X size={21} /></button>
      <div className={`stamp-sheet-image${entry.collected ? '' : ' is-locked'}`}><img src={entry.stampImage} alt={`${entry.templeName}專屬印章`} /></div>
      <div className="stamp-sheet-copy">
        <p className="stamp-sheet-kicker">宮廟專屬印章</p>
        <h2 id="stamp-sheet-title">{entry.templeName}</h2>
        <p className="stamp-sheet-location"><MapPin size={16} />{entry.locationLabel}</p>
        {entry.collected
          ? <><p className="stamp-sheet-state is-collected"><Check size={16} />已收藏</p>{date && <p className="stamp-sheet-date"><CalendarDays size={16} />取得日期：{date}</p>}<p className="stamp-sheet-description">完成「{entry.templeName}探索」後取得。</p></>
          : <><p className="stamp-sheet-state is-locked"><LockKeyhole size={16} />尚未取得</p><p className="stamp-sheet-description">完成該宮廟的探索後，即可收藏這枚專屬印章。</p></>}
        <div className="stamp-sheet-actions">
          <Link className="stamp-sheet-primary" to={entry.templeRoute}><ExternalLink size={17} />查看宮廟</Link>
          {entry.collected && entry.journalRoute && <Link className="stamp-sheet-secondary" to={entry.journalRoute}>查看旅程紀錄</Link>}
        </div>
      </div>
    </section>
  </div>
}
