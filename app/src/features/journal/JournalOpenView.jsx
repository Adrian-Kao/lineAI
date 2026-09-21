import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import JournalBook from './JournalBook.jsx'

export default function JournalOpenView({ entries, pageIndex, turnDirection, onTurn, onClose }) {
  const entry = entries[pageIndex]
  return <section className="journal-open-view" aria-label="打開的旅行手札">
    <header className="journal-reader-header">
      <div><p>我的收藏旅程</p><h1>旅行手札</h1></div>
      <button type="button" className="journal-icon-button" onClick={onClose} aria-label="闔上旅行手札" title="闔上旅行手札"><X size={22} /></button>
    </header>

    {entry
      ? <JournalBook entry={entry} turnDirection={turnDirection} />
      : <div className="journal-empty"><h2>手札還是空白的</h2><p>完成第一間宮廟參訪後，旅程會寫進這裡。</p></div>}

    {entry && <nav className="journal-page-controls" aria-label="手札翻頁">
      <button type="button" className="journal-icon-button" onClick={() => onTurn('previous')} disabled={pageIndex === 0 || Boolean(turnDirection)} aria-label="上一間寺廟"><ChevronLeft size={24} /></button>
      <div className="journal-page-dots" aria-label={`目前第 ${pageIndex + 1} 頁，共 ${entries.length} 頁`}>
        {entries.map((item, index) => <span key={item.id} className={index === pageIndex ? 'is-current' : ''} />)}
      </div>
      <button type="button" className="journal-icon-button" onClick={() => onTurn('next')} disabled={pageIndex === entries.length - 1 || Boolean(turnDirection)} aria-label="下一間寺廟"><ChevronRight size={24} /></button>
    </nav>}
  </section>
}
