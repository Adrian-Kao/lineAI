import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { toDisplayCountyName, toSourceCountyName } from '../../utils/countyNames.js'
import { loadCountyTemples } from '../../services/templeData.js'
import { loadDistrictBoundaries, loadDistrictBoundary } from '../../services/geoData.js'
import { isTempleInDistrict } from '../../utils/districtGeometry.js'
import { useGame } from '../../state/GameContext.js'
import { TASKS } from '../../data/temple.js'
import { applyMapColorPreview, applyTempleLightPreview } from './regionStatus.js'
import { CITY_COORDS } from './mapConfig.js'
import TaiwanTempleMap from './TaiwanTempleMap.jsx'
import TemplePreviewCard from '../temple/TemplePreviewCard.jsx'

const COUNTY_OPTIONS = Object.keys(CITY_COORDS)

export default function MapPage() {
  const { progress } = useGame()
  const completedTempleIds = useMemo(() => {
    const ids = new Set(progress.completedTempleIds ?? [])
    if (TASKS.every(task => progress.missionCompletions[task.id])) ids.add('51c2c438-6bf2-4d6b-b10f-749ae1e95948') // 萬春宮
    return import.meta.env.DEV ? applyTempleLightPreview(ids) : ids
  }, [progress])
  const [districts, setDistricts] = useState(null)
  const regionProgress = useMemo(() => {
    const completed = TASKS.filter(task => progress.missionCompletions[task.id]).length
    const actual = { ...progress.regionProgress, '66000010': completed === TASKS.length ? 'unlocked' : completed > 0 ? 'inProgress' : 'locked' }
    return import.meta.env.DEV ? applyMapColorPreview(actual, districts) : actual
  }, [progress, districts])
  const { county } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [dataState, setDataState] = useState({ county: null, temples: null, error: '' })
  const [retryCount, setRetryCount] = useState(0)
  const [mapRetry, setMapRetry] = useState(0)
  const [mapError, setMapError] = useState('')
  const [districtError, setDistrictError] = useState('')
  const [templePosition, setTemplePosition] = useState(null)
  const [search, setSearch] = useState({ county: '', value: '' })
  const viewRef = useRef(null)
  const selectedCounty = county ? toDisplayCountyName(county) : null
  const selectedDistrictId = new URLSearchParams(location.search).get('district')
  const [districtDetail, setDistrictDetail] = useState(null)
  const selectedDistrict = districtDetail?.properties.TOWNCODE === selectedDistrictId ? districtDetail : districts?.features.find(item => item.properties.TOWNCODE === selectedDistrictId)
  const regionName = selectedDistrict ? selectedCounty + selectedDistrict.properties.TOWNNAME : selectedCounty
  const selectedTempleId = new URLSearchParams(location.search).get('temple')
  const activeData = dataState.county === selectedCounty ? dataState : null
  const countyTemples = activeData?.temples ?? null
  const temples = useMemo(() => selectedDistrictId ? (selectedDistrict && countyTemples ? countyTemples.filter(item => isTempleInDistrict(item, selectedDistrict)) : null) : countyTemples, [selectedDistrictId, selectedDistrict, countyTemples])
  const previewTemple = temples?.find(item => item.id === selectedTempleId) ?? null
  const query = search.county === selectedCounty ? search.value.trim() : ''
  const searchResults = query && temples ? temples.filter(item => item.name.includes(query)).slice(0, 8) : []

  useEffect(() => {
    let active = true
    loadDistrictBoundaries().then(data => { if (active) setDistricts(data) }).catch(() => {})
    return () => { active = false }
  }, [mapRetry])

  useEffect(() => {
    if (!selectedDistrictId) return
    let active = true
    loadDistrictBoundary(selectedDistrictId).then(feature => { if (active) setDistrictDetail(feature) })
      .catch(error => { if (active) setDistrictError(error.message) })
    return () => { active = false }
  }, [selectedDistrictId, mapRetry])

  useEffect(() => {
    if (!selectedCounty || !toSourceCountyName(selectedCounty)) return
    const controller = new AbortController()
    loadCountyTemples(selectedCounty, controller.signal)
      .then(data => { if (!controller.signal.aborted) setDataState({ county: selectedCounty, temples: data, error: '' }) })
      .catch(error => { if (!controller.signal.aborted) setDataState({ county: selectedCounty, temples: null, error: error.message }) })
    return () => controller.abort()
  }, [selectedCounty, retryCount])

  const handleDistrictSelect = useCallback((name, id) => {
    navigate({ pathname: ROUTES.county.replace(':county', encodeURIComponent(name)), search: `?district=${encodeURIComponent(id)}` })
  }, [navigate])

  const handleTempleSelect = useCallback(id => {
    navigate({ pathname: ROUTES.county.replace(':county', encodeURIComponent(selectedCounty)), search: `?${selectedDistrictId ? `district=${encodeURIComponent(selectedDistrictId)}&` : ''}temple=${encodeURIComponent(id)}` }, { state: { returnView: viewRef.current } })
  }, [navigate, selectedCounty, selectedDistrictId])

  const closePreview = useCallback(() => {
    navigate({ pathname: ROUTES.county.replace(':county', encodeURIComponent(selectedCounty)), search: selectedDistrictId ? `?district=${encodeURIComponent(selectedDistrictId)}` : '' }, { state: { returnView: viewRef.current } })
  }, [navigate, selectedCounty, selectedDistrictId])

  if (county && !toSourceCountyName(county)) return <Navigate to={ROUTES.map} replace />

  return <main className="map-page">
    <div className="map-stage">
      <TaiwanTempleMap key={mapRetry} completedTempleIds={completedTempleIds} regionProgress={regionProgress} selectedDistrictId={selectedDistrictId} selectedDistrict={selectedDistrict} selectedCounty={selectedCounty} selectedTemple={previewTemple} selectedTempleId={selectedTempleId}
        temples={temples} restoreView={location.state?.returnView} onDistrictSelect={handleDistrictSelect} onOverviewSelect={() => navigate(ROUTES.map)}
        onTempleSelect={handleTempleSelect} onViewChange={view => { viewRef.current = view }} onTemplePositionChange={setTemplePosition}
        onMapError={setMapError} onDistrictError={setDistrictError} />
      {mapError && <div className="map-status" role="alert"><p>地圖載入失敗</p><button type="button" onClick={() => { setMapError(''); setMapRetry(value => value + 1) }}>重試</button></div>}
      {!mapError && <div className="county-tools">
        <select className="county-select" aria-label="選擇縣市" value={selectedCounty ?? ''}
          onChange={event => navigate(event.target.value ? ROUTES.county.replace(':county', encodeURIComponent(event.target.value)) : ROUTES.map)}>
          <option value="">全台地圖：選擇縣市</option>
          {COUNTY_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        {selectedCounty && <>
        <div className="district-heading"><strong>{regionName}</strong><button type="button" onClick={() => navigate(ROUTES.map)}>全台地圖</button></div>
        <input aria-label="搜尋宮廟" placeholder={`搜尋${regionName}宮廟`} value={query} onChange={event => setSearch({ county: selectedCounty, value: event.target.value })} />
        {query && <div className="county-results" role="listbox" aria-label="宮廟搜尋結果">
          {searchResults.length ? searchResults.map(item => <button type="button" key={item.id} role="option" aria-selected={item.id === selectedTempleId} onClick={() => { handleTempleSelect(item.id); setSearch({ county: selectedCounty, value: '' }) }}>{item.name}</button>) : <p>沒有符合的宮廟</p>}
        </div>}
        {!activeData && <p className="county-load" role="status">宮廟資料載入中…</p>}
        {activeData?.error && <p className="county-load" role="alert">載入失敗 <button type="button" onClick={() => setRetryCount(value => value + 1)}>重試</button></p>}
        {districtError && <p className="county-load" role="alert">{districtError}</p>}
        {temples?.length === 0 && <p className="county-load">這個區域目前沒有符合條件的宮廟</p>}
        </>}
      </div>}
      {previewTemple && templePosition?.id === previewTemple.id && <TemplePreviewCard temple={previewTemple} onClose={closePreview} detailState={{ returnView: templePosition.view, returnDistrictId: selectedDistrictId }}
        style={{ left: templePosition.x, top: templePosition.y }} />}
    </div>
    {selectedTempleId && temples && !previewTemple && <div className="temple-preview temple-not-found" role="alert"><p>找不到這間宮廟</p><button type="button" onClick={closePreview}>關閉</button></div>}
  </main>
}
