import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { toDisplayCountyName, toSourceCountyName } from '../../utils/countyNames.js'
import { loadCountyTemples } from '../../services/templeData.js'
import TaiwanTempleMap from './TaiwanTempleMap.jsx'
import TemplePreviewCard from '../temple/TemplePreviewCard.jsx'
import HamburgerButton from '../../components/navigation/HamburgerButton.jsx'
import SideDrawer from '../../components/navigation/SideDrawer.jsx'

const mockRegionProgress = { 台中市: 'inProgress', 台北市: 'unlocked' }

export default function MapPage() {
  const { county } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dataState, setDataState] = useState({ county: null, temples: null, error: '' })
  const [retryCount, setRetryCount] = useState(0)
  const [mapRetry, setMapRetry] = useState(0)
  const [mapError, setMapError] = useState('')
  const [districtError, setDistrictError] = useState('')
  const [templePosition, setTemplePosition] = useState(null)
  const [search, setSearch] = useState({ county: '', value: '' })
  const viewRef = useRef(null)
  const selectedCounty = county ? toDisplayCountyName(county) : null
  const selectedTempleId = new URLSearchParams(location.search).get('temple')
  const activeData = dataState.county === selectedCounty ? dataState : null
  const temples = activeData?.temples ?? null
  const previewTemple = temples?.find(item => item.id === selectedTempleId) ?? null
  const query = search.county === selectedCounty ? search.value.trim() : ''
  const searchResults = query && temples ? temples.filter(item => item.name.includes(query)).slice(0, 8) : []

  useEffect(() => {
    if (!selectedCounty || !toSourceCountyName(selectedCounty)) return
    const controller = new AbortController()
    loadCountyTemples(selectedCounty, controller.signal)
      .then(data => { if (!controller.signal.aborted) setDataState({ county: selectedCounty, temples: data, error: '' }) })
      .catch(error => { if (!controller.signal.aborted) setDataState({ county: selectedCounty, temples: null, error: error.message }) })
    return () => controller.abort()
  }, [selectedCounty, retryCount])

  const handleCountySelect = useCallback(name => {
    navigate(ROUTES.county.replace(':county', encodeURIComponent(name)))
  }, [navigate])

  const handleTempleSelect = useCallback(id => {
    navigate({ pathname: ROUTES.county.replace(':county', encodeURIComponent(selectedCounty)), search: `?temple=${encodeURIComponent(id)}` }, { state: { returnView: viewRef.current } })
  }, [navigate, selectedCounty])

  const closePreview = useCallback(() => {
    navigate(ROUTES.county.replace(':county', encodeURIComponent(selectedCounty)), { state: { returnView: viewRef.current } })
  }, [navigate, selectedCounty])

  if (county && !toSourceCountyName(county)) return <Navigate to={ROUTES.map} replace />

  return <main className="map-page">
    <div className="map-stage">
      <TaiwanTempleMap key={mapRetry} regionProgress={mockRegionProgress} selectedCounty={selectedCounty} selectedTemple={previewTemple} selectedTempleId={selectedTempleId}
        temples={temples} restoreView={location.state?.returnView} onCountySelect={handleCountySelect}
        onTempleSelect={handleTempleSelect} onViewChange={view => { viewRef.current = view }} onTemplePositionChange={setTemplePosition}
        onMapError={setMapError} onDistrictError={setDistrictError} />
      {mapError && <div className="map-status" role="alert"><p>地圖載入失敗</p><button type="button" onClick={() => { setMapError(''); setMapRetry(value => value + 1) }}>重試</button></div>}
      {selectedCounty && !mapError && <div className="county-tools">
        <input aria-label="搜尋宮廟" placeholder={`搜尋${selectedCounty}宮廟`} value={query} onChange={event => setSearch({ county: selectedCounty, value: event.target.value })} />
        {query && <div className="county-results" role="listbox" aria-label="宮廟搜尋結果">
          {searchResults.length ? searchResults.map(item => <button type="button" key={item.id} role="option" aria-selected={item.id === selectedTempleId} onClick={() => { handleTempleSelect(item.id); setSearch({ county: selectedCounty, value: '' }) }}>{item.name}</button>) : <p>沒有符合的宮廟</p>}
        </div>}
        {!activeData && <p className="county-load" role="status">宮廟資料載入中…</p>}
        {activeData?.error && <p className="county-load" role="alert">載入失敗 <button type="button" onClick={() => setRetryCount(value => value + 1)}>重試</button></p>}
        {districtError && <p className="county-load" role="alert">{districtError}</p>}
        {temples?.length === 0 && <p className="county-load">這個縣市目前沒有符合條件的宮廟</p>}
      </div>}
      {previewTemple && templePosition?.id === previewTemple.id && <TemplePreviewCard temple={previewTemple} onClose={closePreview} returnView={templePosition.view}
        style={{ left: templePosition.x, top: templePosition.y }} />}
    </div>
    {selectedTempleId && temples && !previewTemple && <div className="temple-preview temple-not-found" role="alert"><p>找不到這間宮廟</p><button type="button" onClick={closePreview}>關閉</button></div>}
    <HamburgerButton onClick={() => setDrawerOpen(true)} expanded={drawerOpen} />
    <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
  </main>
}
