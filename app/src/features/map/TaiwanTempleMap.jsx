import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import { loadCountyBoundaries, loadDistrictBoundaries, findCountyFeature, getMainlandBounds } from '../../services/geoData.js'
import { getCountyName } from './geoLoader.js'
import { getRegionStatus, REGION_STATUS_COLORS } from './regionStatus.js'
import './markerStyles.css'

const countyPadding = [28, 36]
const tileUrl = 'https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}'

function boundaryStyle(feature, regionProgress, selectedCounty) {
  const name = getCountyName(feature)
  const colors = REGION_STATUS_COLORS[getRegionStatus(regionProgress, name)]
  return {
    color: `rgb(${colors.line.slice(0, 3).join(',')})`,
    weight: 1,
    fillColor: `rgb(${colors.fill.slice(0, 3).join(',')})`,
    fillOpacity: name === selectedCounty ? 0.12 : colors.fill[3] / 255,
  }
}

function markerIcon(selected = false) {
  return L.divIcon({ className: `temple-pin${selected ? ' is-selected' : ''}`, html: '<span></span>', iconSize: [22, 27], iconAnchor: [11, 26] })
}

function clusterIcon(cluster) {
  return L.divIcon({ className: 'temple-cluster', html: `<span>${cluster.getChildCount()}</span>`, iconSize: [42, 42] })
}

export default function TaiwanTempleMap({ selectedCounty, selectedTemple, selectedTempleId, temples, regionProgress, restoreView, onCountySelect, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const boundaryRef = useRef(null)
  const layersByCountyRef = useRef(new Map())
  const clusterRef = useRef(null)
  const tileRef = useRef(null)
  const districtRef = useRef(null)
  const markerByIdRef = useRef(new Map())
  const batchTimerRef = useRef(null)
  const lastCountyRef = useRef(undefined)
  const callbacksRef = useRef({ onCountySelect, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError })
  const progressRef = useRef(regionProgress)
  const selectedTempleRef = useRef(selectedTempleId)
  const [geometryReady, setGeometryReady] = useState(0)

  useEffect(() => {
    callbacksRef.current = { onCountySelect, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError }
    progressRef.current = regionProgress
    selectedTempleRef.current = selectedTempleId
  }, [onCountySelect, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError, regionProgress, selectedTempleId])

  useEffect(() => {
    const map = L.map(containerRef.current, {
      zoomControl: false, scrollWheelZoom: true, touchZoom: true,
      maxZoom: 18, minZoom: 5, zoomSnap: 0.25,
    }).setView([23.8, 121], 7)
    mapRef.current = map
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 60, zoomToBoundsOnClick: true,
      showCoverageOnHover: false, chunkedLoading: true,
      animateAddingMarkers: false, spiderfyOnMaxZoom: true,
      iconCreateFunction: clusterIcon,
    }).addTo(map)
    clusterRef.current = cluster
    const saveView = () => callbacksRef.current.onViewChange({ center: [map.getCenter().lat, map.getCenter().lng], zoom: map.getZoom() })
    map.on('moveend', saveView)
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    observer.observe(containerRef.current)
    const markerById = markerByIdRef.current

    let mounted = true
    loadCountyBoundaries().then(collection => {
      if (!mounted) return
      const layers = new Map()
      const boundaries = L.geoJSON(collection, {
        style: feature => boundaryStyle(feature, progressRef.current, null),
        onEachFeature: (feature, layer) => {
          const name = getCountyName(feature)
          if (!name) return
          layers.set(name, layer)
          layer.on('mouseover', () => layer.setStyle({ weight: 2, color: '#547b57', fillOpacity: name === lastCountyRef.current ? 0.12 : 1 }))
          layer.on('mouseout', () => layer.setStyle(boundaryStyle(feature, progressRef.current, lastCountyRef.current)))
          layer.on('click', () => callbacksRef.current.onCountySelect(name))
        },
      }).addTo(map)
      boundaryRef.current = { boundaries, collection }
      layersByCountyRef.current = layers
      lastCountyRef.current = undefined
      callbacksRef.current.onMapError('')
      // Route-driven camera updates run in the effect below after geometry is ready.
      setGeometryReady(value => value + 1)
    }).catch(error => { if (mounted) callbacksRef.current.onMapError(error.message || '縣市邊界載入失敗') })

    return () => {
      mounted = false
      clearTimeout(batchTimerRef.current)
      observer.disconnect()
      map.off('moveend', saveView)
      map.remove()
      mapRef.current = null
      boundaryRef.current = null
      clusterRef.current = null
      tileRef.current = null
      districtRef.current = null
      markerById.clear()
      layersByCountyRef.current.clear()
    }
  }, []) // Leaflet owns its DOM; route and data changes update the existing instance below.

  useEffect(() => {
    const map = mapRef.current
    const boundary = boundaryRef.current
    if (!map || !boundary || lastCountyRef.current === selectedCounty) return
    const previousCounty = lastCountyRef.current
    lastCountyRef.current = selectedCounty
    const clearDetailLayers = () => {
      if (districtRef.current) { map.removeLayer(districtRef.current); districtRef.current = null }
      if (tileRef.current) { map.removeLayer(tileRef.current); tileRef.current = null }
    }
    callbacksRef.current.onDistrictError('')
    let active = true
    if (selectedCounty) {
      clearDetailLayers()
      boundary.boundaries.eachLayer(layer => layer.setStyle(boundaryStyle(layer.feature, progressRef.current, selectedCounty)))
      const feature = findCountyFeature(boundary.collection, selectedCounty)
      if (!feature) return
      const focus = getMainlandBounds({ features: [feature] })
      const bounds = Number.isFinite(focus[0][0]) ? L.latLngBounds(focus) : layersByCountyRef.current.get(selectedCounty).getBounds()
      if (restoreView && Array.isArray(restoreView.center) && restoreView.center.every(Number.isFinite) && Number.isFinite(restoreView.zoom)) {
        map.setView(restoreView.center, restoreView.zoom, { animate: false })
      } else {
        map.flyToBounds(bounds, { padding: countyPadding, maxZoom: 10, duration: 0.85 })
      }
      tileRef.current = L.tileLayer(tileUrl, { attribution: '© 國土測繪圖資服務雲', maxZoom: 18 }).addTo(map)
      loadDistrictBoundaries().then(collection => {
        if (!active) return
        const features = collection.features.filter(item => getCountyName(item) === selectedCounty)
        if (!features.length) throw new Error(`${selectedCounty}沒有區域分界資料`)
        districtRef.current = L.geoJSON({ type: 'FeatureCollection', features }, {
          interactive: false,
          style: { color: '#526c58', weight: 1.15, opacity: 0.8, fillOpacity: 0 },
        }).addTo(map)
      }).catch(error => { if (active) callbacksRef.current.onDistrictError(error.message || '區域分界載入失敗') })
    } else {
      const focus = getMainlandBounds(boundary.collection)
      if (Number.isFinite(focus[0][0])) {
        const bounds = L.latLngBounds(focus)
        const options = { padding: [18, 28], maxZoom: 8 }
        if (previousCounty) {
          const finish = () => {
            clearDetailLayers()
            boundary.boundaries.eachLayer(layer => layer.setStyle(boundaryStyle(layer.feature, progressRef.current, null)))
          }
          map.once('moveend', finish)
          map.flyToBounds(bounds, { ...options, duration: 0.85 })
          return () => { active = false; map.off('moveend', finish) }
        }
        clearDetailLayers()
        boundary.boundaries.eachLayer(layer => layer.setStyle(boundaryStyle(layer.feature, progressRef.current, null)))
        map.fitBounds(bounds, { ...options, animate: false })
      }
    }
    return () => { active = false }
  }, [selectedCounty, geometryReady, restoreView])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedTemple) return
    const latLng = L.latLng(selectedTemple.latitude, selectedTemple.longitude)
    map.setView(latLng, Math.max(map.getZoom(), 15), { animate: false })
    const selectedMarker = L.marker(latLng, {
      icon: markerIcon(true), interactive: false, zIndexOffset: 1000,
    }).addTo(map)
    const reportPosition = () => {
      const point = map.latLngToContainerPoint(latLng)
      callbacksRef.current.onTemplePositionChange({ id: selectedTemple.id, x: point.x, y: point.y,
        view: { center: [map.getCenter().lat, map.getCenter().lng], zoom: map.getZoom() } })
    }
    map.on('move zoom resize', reportPosition)
    reportPosition()
    return () => {
      map.off('move zoom resize', reportPosition)
      map.removeLayer(selectedMarker)
    }
  }, [selectedTemple, geometryReady])

  useEffect(() => {
    const cluster = clusterRef.current
    if (!cluster) return
    clearTimeout(batchTimerRef.current)
    cluster.clearLayers()
    markerByIdRef.current.clear()
    if (!selectedCounty || !temples?.length) return
    let index = 0
    let cancelled = false
    function appendBatch() {
      if (cancelled) return
      const batch = temples.slice(index, index + 80).map(temple => {
        const marker = L.marker([temple.latitude, temple.longitude], { icon: markerIcon(temple.id === selectedTempleRef.current), title: temple.name })
        marker.on('click', event => {
          L.DomEvent.stopPropagation(event)
          callbacksRef.current.onTempleSelect(temple.id)
        })
        markerByIdRef.current.set(temple.id, marker)
        return marker
      })
      if (batch.length) cluster.addLayers(batch)
      index += batch.length
      if (index < temples.length) batchTimerRef.current = setTimeout(appendBatch, 0)
    }
    appendBatch()
    return () => { cancelled = true; clearTimeout(batchTimerRef.current); cluster.clearLayers() }
  }, [selectedCounty, temples])

  useEffect(() => {
    markerByIdRef.current.forEach((marker, id) => marker.setIcon(markerIcon(id === selectedTempleId)))
  }, [selectedTempleId, temples])

  return <div className="leaflet-map" ref={containerRef} aria-label="台灣縣市與宮廟地圖" />
}
