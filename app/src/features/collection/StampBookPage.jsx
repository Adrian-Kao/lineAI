import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Map, Stamp } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { loadAdministrativeRegions } from '../../services/administrativeRegions.js'
import { useGame } from '../../state/GameContext.js'
import { buildStampEntries, loadTaichungDemoStampCatalog } from './stampBookData.js'
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
  const [selectedStamp, setSelectedStamp] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [regions, setRegions] = useState([])
  const [catalogStatus, setCatalogStatus] = useState('loading')
  const returnFocusRef = useRef(null)
  const entries = useMemo(() => buildStampEntries(catalog, progress.stampRecords), [catalog, progress.stampRecords])
  const collectedCount = entries.filter(entry => entry.collected).length

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
    const controller = new AbortController()
    Promise.all([
      loadTaichungDemoStampCatalog(controller.signal),
      loadAdministrativeRegions(controller.signal),
    ])
      .then(([nextCatalog, nextRegions]) => {
        setCatalog(nextCatalog)
        setRegions(nextRegions)
        setCatalogStatus('ready')
      })
      .catch(error => {
        if (error.name !== 'AbortError') setCatalogStatus('error')
      })
    return () => controller.abort()
  }, [])

  function openStamp(entry, trigger) {
    returnFocusRef.current = trigger
    setSelectedStamp(entry)
  }

  const closeStamp = useCallback(() => {
    setSelectedStamp(null)
    window.requestAnimationFrame(() => returnFocusRef.current?.focus())
  }, [])

  if (catalogStatus !== 'ready') return <main className="stamp-book-page">
    <section className="stamp-book-unavailable"><Stamp size={35} /><h1>{catalogStatus === 'error' ? '集章簿資料載入失敗' : '正在整理宮廟印章…'}</h1>{catalogStatus === 'error' && <a href={ROUTES.stamps}>重新載入</a>}</section>
  </main>

  return <main className="stamp-book-page">
    <div className="stamp-book-inner">
      <header className="stamp-book-header">
        <div><p>宮廟文化收藏{import.meta.env.DEV && <span>DEMO</span>}</p><h1>集章簿</h1></div>
        <strong>已收藏 {collectedCount} / {entries.length}</strong>
      </header>

      <div className="stamp-progress" aria-hidden="true"><span style={{ width: `${entries.length ? (collectedCount / entries.length) * 100 : 0}%` }} /></div>

      <section className="stamp-toolbar" aria-label="篩選印章">
        <div className="stamp-segments" role="group" aria-label="收藏狀態">
          {FILTERS.map(filter => <button key={filter.id} type="button" className={statusFilter === filter.id ? 'is-active' : ''} aria-pressed={statusFilter === filter.id} onClick={() => setStatusFilter(filter.id)}>{filter.label}</button>)}
        </div>
      </section>

      {collectedCount === 0 && <section className="stamp-empty-notice">
        <Stamp size={25} aria-hidden="true" />
        <div><strong>你的集章簿還是空的</strong><p>完成第一間宮廟探索後，專屬印章就會出現在這裡。</p></div>
        <Link to={ROUTES.map}><Map size={17} />前往地圖</Link>
      </section>}

      <StampGrid entries={entries} regions={regions} statusFilter={statusFilter} onSelect={openStamp} />
      {import.meta.env.DEV && <p className="stamp-demo-note">目前開放台中市中區、北區與西區宮廟印章，其餘區域保留收藏欄位。</p>}
    </div>
    {selectedStamp && <StampDetailSheet entry={selectedStamp} onClose={closeStamp} />}
  </main>
}
