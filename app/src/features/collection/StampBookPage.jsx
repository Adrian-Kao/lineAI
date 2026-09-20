import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Map, Stamp } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { useGame } from '../../state/GameContext.js'
import { buildStampEntries, getPlayableStampCatalog } from './stampBookData.js'
import StampGrid from './StampGrid.jsx'
import StampDetailSheet from './StampDetailSheet.jsx'
import './stampBook.css'

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'collected', label: '已收藏' },
  { id: 'locked', label: '未收藏' },
]

export default function StampBookPage() {
  const { progress } = useGame()
  const [statusFilter, setStatusFilter] = useState('all')
  const [countyFilter, setCountyFilter] = useState('all')
  const [selectedStamp, setSelectedStamp] = useState(null)
  const returnFocusRef = useRef(null)
  const catalog = useMemo(() => getPlayableStampCatalog(import.meta.env.DEV), [])
  const entries = useMemo(() => buildStampEntries(catalog, progress.stampRecords), [catalog, progress.stampRecords])
  const counties = useMemo(() => [...new Set(entries.map(entry => entry.county))], [entries])
  const scopedEntries = countyFilter === 'all' ? entries : entries.filter(entry => entry.county === countyFilter)
  const visibleEntries = scopedEntries.filter(entry => statusFilter === 'all' || (statusFilter === 'collected' ? entry.collected : !entry.collected))
  const collectedCount = scopedEntries.filter(entry => entry.collected).length
  const allCollectedCount = entries.filter(entry => entry.collected).length

  useEffect(() => { window.scrollTo({ top: 0, left: 0 }) }, [])

  function openStamp(entry, trigger) {
    returnFocusRef.current = trigger
    setSelectedStamp(entry)
  }

  const closeStamp = useCallback(() => {
    setSelectedStamp(null)
    window.requestAnimationFrame(() => returnFocusRef.current?.focus())
  }, [])

  if (!entries.length) return <main className="stamp-book-page">
    <section className="stamp-book-unavailable"><Stamp size={35} /><h1>目前尚未開放可收藏的宮廟印章</h1><Link to={ROUTES.map}>返回地圖</Link></section>
  </main>

  return <main className="stamp-book-page">
    <div className="stamp-book-inner">
      <header className="stamp-book-header">
        <div><p>宮廟文化收藏{import.meta.env.DEV && <span>DEMO</span>}</p><h1>集章簿</h1></div>
        <strong>已收藏 {collectedCount} / {scopedEntries.length}</strong>
      </header>

      <div className="stamp-progress" aria-hidden="true"><span style={{ width: `${scopedEntries.length ? (collectedCount / scopedEntries.length) * 100 : 0}%` }} /></div>

      <section className="stamp-toolbar" aria-label="篩選印章">
        <div className="stamp-segments" role="group" aria-label="收藏狀態">
          {FILTERS.map(filter => <button key={filter.id} type="button" className={statusFilter === filter.id ? 'is-active' : ''} aria-pressed={statusFilter === filter.id} onClick={() => setStatusFilter(filter.id)}>{filter.label}</button>)}
        </div>
        <label className="stamp-county-filter"><span className="sr-only">選擇縣市</span><select value={countyFilter} onChange={event => setCountyFilter(event.target.value)}><option value="all">全台</option>{counties.map(county => <option key={county} value={county}>{county}</option>)}</select></label>
      </section>

      {allCollectedCount === 0 && <section className="stamp-empty-notice">
        <Stamp size={25} aria-hidden="true" />
        <div><strong>你的集章簿還是空的</strong><p>完成第一間宮廟探索後，專屬印章就會出現在這裡。</p></div>
        <Link to={ROUTES.map}><Map size={17} />前往地圖</Link>
      </section>}

      <StampGrid entries={visibleEntries} onSelect={openStamp} />
      {import.meta.env.DEV && <p className="stamp-demo-note">目前以 6 間 DEMO 活動宮廟驗證版面；收藏狀態仍只讀取實際任務紀錄。</p>}
    </div>
    {selectedStamp && <StampDetailSheet entry={selectedStamp} onClose={closeStamp} />}
  </main>
}
