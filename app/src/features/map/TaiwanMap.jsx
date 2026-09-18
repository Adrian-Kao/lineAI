import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { GeoJsonLayer } from '@deck.gl/layers'
import { FlyToInterpolator, WebMercatorViewport } from '@deck.gl/core'
import { CITY_COORDS, COUNTY_ZOOM, MAP_LIMITS } from './mapConfig.js'
import { getCollectionBounds, getCountyName, loadFeatureCollection } from './geoLoader.js'
import { getRegionStatus, REGION_STATUS_COLORS } from './regionStatus.js'

const initialView = { longitude: 121, latitude: 24, zoom: 6, pitch: 0, bearing: 0 }

export default function TaiwanMap({ regionProgress, selectedCounty, onCountySelect }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 390, height: 620 })
  const [countyGeoJson, setCountyGeoJson] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [hoveredCounty, setHoveredCounty] = useState(null)
  const [viewState, setViewState] = useState(initialView)

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ width, height })
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadFeatureCollection('/geo/taiwan-counties.topo.json', controller.signal)
      .then(data => { setCountyGeoJson(data); setLoadError('') })
      .catch(error => { if (error.name !== 'AbortError') setLoadError(error.message || '地圖載入失敗') })
    return () => controller.abort()
  }, [retryKey])

  useEffect(() => {
    if (!countyGeoJson) return
    const frame = requestAnimationFrame(() => {
      const target = CITY_COORDS[selectedCounty]
      if (target) {
        const countyFeature = countyGeoJson.features.find(item => getCountyName(item) === selectedCounty)
        const viewport = new WebMercatorViewport({ ...initialView, width: size.width, height: size.height })
        const fitted = viewport.fitBounds(getCollectionBounds({ features: [countyFeature] }), { padding: 42 })
        setViewState(previous => ({
          ...previous, ...target, zoom: Math.min(COUNTY_ZOOM, fitted.zoom), pitch: 0, bearing: 0,
          transitionDuration: 950,
          transitionInterpolator: new FlyToInterpolator({ speed: 1.3 }),
        }))
        return
      }
      const viewport = new WebMercatorViewport({ ...initialView, width: size.width, height: size.height })
      const fitted = viewport.fitBounds(getCollectionBounds(countyGeoJson), { padding: 18 })
      setViewState({ longitude: fitted.longitude, latitude: fitted.latitude, zoom: Math.min(fitted.zoom, 7), pitch: 0, bearing: 0 })
    })
    return () => cancelAnimationFrame(frame)
  }, [countyGeoJson, selectedCounty, size.width, size.height])

  const handleHover = useCallback(info => {
    const name = getCountyName(info.object)
    setHoveredCounty(current => current === name ? current : name || null)
  }, [])

  const handleClick = useCallback(info => {
    const name = getCountyName(info.object)
    if (name && CITY_COORDS[name]) onCountySelect(name)
  }, [onCountySelect])

  const handleViewStateChange = useCallback(({ viewState: next }) => {
    setViewState({
      ...next,
      longitude: Math.max(MAP_LIMITS.minLongitude, Math.min(MAP_LIMITS.maxLongitude, next.longitude)),
      latitude: Math.max(MAP_LIMITS.minLatitude, Math.min(MAP_LIMITS.maxLatitude, next.latitude)),
      zoom: Math.max(MAP_LIMITS.minZoom, Math.min(MAP_LIMITS.maxZoom, next.zoom)),
      pitch: 0,
      bearing: 0,
    })
  }, [])

  const layers = useMemo(() => countyGeoJson ? [new GeoJsonLayer({
    id: 'taiwan-counties',
    data: countyGeoJson,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    lineWidthMinPixels: 1,
    getLineWidth: feature => getCountyName(feature) === selectedCounty ? 2 : 1,
    getFillColor: feature => {
      const name = getCountyName(feature)
      const color = REGION_STATUS_COLORS[getRegionStatus(regionProgress, name)].fill
      return name === hoveredCounty ? [Math.min(255, color[0] + 17), Math.min(255, color[1] + 13), Math.min(255, color[2] + 11), color[3]] : color
    },
    getLineColor: feature => {
      const name = getCountyName(feature)
      return name === hoveredCounty || name === selectedCounty ? [66, 117, 66, 255] : REGION_STATUS_COLORS[getRegionStatus(regionProgress, name)].line
    },
    onHover: handleHover,
    onClick: handleClick,
    updateTriggers: {
      getFillColor: [regionProgress, hoveredCounty],
      getLineColor: [regionProgress, hoveredCounty, selectedCounty],
      getLineWidth: [selectedCounty],
    },
    transitions: { getFillColor: 180, getLineColor: 180 },
  })] : [], [countyGeoJson, regionProgress, hoveredCounty, selectedCounty, handleHover, handleClick])

  return <div className="taiwan-map" ref={containerRef}>
    {!countyGeoJson && !loadError && <p className="map-status" role="status">地圖載入中…</p>}
    {loadError && <div className="map-status" role="alert"><p>地圖載入失敗</p><button type="button" onClick={() => { setLoadError(''); setRetryKey(value => value + 1) }}>重試</button></div>}
    {countyGeoJson && <DeckGL
      width="100%"
      height="100%"
      layers={layers}
      viewState={viewState}
      onViewStateChange={handleViewStateChange}
      getCursor={() => hoveredCounty ? 'pointer' : 'grab'}
      controller={{ dragPan: true, dragRotate: false, scrollZoom: true, touchZoom: true, touchRotate: false, doubleClickZoom: false }}
    />}
    <span className="sr-only" aria-live="polite">{selectedCounty ? `已選取${selectedCounty}` : '台灣縣市地圖'}</span>
    {/* TODO: Load a district layer after county selection in phase two. */}
  </div>
}
