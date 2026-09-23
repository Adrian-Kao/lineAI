import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Map, Stamp } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { loadAdministrativeRegions } from '../../services/administrativeRegions.js'
import { loadPublishedTempleCount } from '../../services/templeData.js'
import { useGame } from '../../state/GameContext.js'
import { useSettings } from '../../state/SettingsContext.js'
import { buildStampEntries, loadTaichungDemoStampCatalog } from './stampBookData.js'
import StampGrid from './StampGrid.jsx'
import StampDetailSheet from './StampDetailSheet.jsx'
import './stampBook.css'

export default function StampBookPage() {
  const { progress, demoControls } = useGame()
  const { language, t } = useSettings()
  const [selectedStamp, setSelectedStamp] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [regions, setRegions] = useState([])
  const [totalTempleCount, setTotalTempleCount] = useState(0)
  const [catalogStatus, setCatalogStatus] = useState('loading')
  const returnFocusRef = useRef(null)
  const displayStampRecords = useMemo(() => {
    if (!demoControls.centralComplete) return progress.stampRecords
    const realKeys = new Set(progress.stampRecords.map(record => record.templeId ?? record.taskId))
    const demoRecords = catalog
      .filter(entry => entry.district === '中區' && !realKeys.has(entry.templeId) && !(entry.legacyTaskId && realKeys.has(entry.legacyTaskId)))
      .map(entry => ({ templeId: entry.templeId, acquiredAt: '2026-09-23T00:00:00.000Z', demo: true }))
    return [...progress.stampRecords, ...demoRecords]
  }, [catalog, progress.stampRecords, demoControls.centralComplete])
  const entries = useMemo(() => buildStampEntries(catalog, displayStampRecords), [catalog, displayStampRecords])
  const collectedCount = entries.filter(entry => entry.collected).length

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
    const controller = new AbortController()
    Promise.all([
      loadTaichungDemoStampCatalog(controller.signal),
      loadAdministrativeRegions(controller.signal),
      loadPublishedTempleCount(),
    ])
      .then(([nextCatalog, nextRegions, nextTotalTempleCount]) => {
        setCatalog(nextCatalog)
        setRegions(nextRegions)
        setTotalTempleCount(nextTotalTempleCount)
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
    <section className="stamp-book-unavailable"><Stamp size={35} /><h1>{t(catalogStatus === 'error' ? 'stampbook.loadFailed' : 'stampbook.loading')}</h1>{catalogStatus === 'error' && <a href={ROUTES.stamps}>{t('stampbook.reload')}</a>}</section>
  </main>

  return <main className="stamp-book-page">
    <div className="stamp-book-inner">
      <header className="stamp-book-header collection-index-header">
        <div><p>{t('stampbook.eyebrow')}</p><h1>{t('stampbook.title')}</h1></div>
        <span className="demo-badge">{t('stampbook.collectedCount', { count: collectedCount, total: totalTempleCount.toLocaleString(language === 'en' ? 'en-US' : 'zh-TW') })}</span>
      </header>

      <div className="stamp-progress" aria-hidden="true"><span style={{ width: `${totalTempleCount ? (collectedCount / totalTempleCount) * 100 : 0}%` }} /></div>

      {collectedCount === 0 && <section className="stamp-empty-notice">
        <Stamp size={25} aria-hidden="true" />
        <div><strong>{t('stampbook.emptyTitle')}</strong><p>{t('stampbook.emptyBody')}</p></div>
        <Link to={ROUTES.map}><Map size={17} />{t('stampbook.goMap')}</Link>
      </section>}

      <StampGrid entries={entries} regions={regions} onSelect={openStamp} />
    </div>
    {selectedStamp && <StampDetailSheet entry={selectedStamp} onClose={closeStamp} />}
  </main>
}
