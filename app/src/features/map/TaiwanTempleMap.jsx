import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import { loadDistrictBoundaries, loadCountyBorders, getMainlandBounds } from '../../services/geoData.js'
import { getCountyName, getCollectionBounds } from './geoLoader.js'
import { isTempleInDistrict } from '../../utils/districtGeometry.js'
import { getRegionStatus, REGION_STATUS_COLORS } from './regionStatus.js'
import './markerStyles.css'

const countyPadding = [28, 36]
const tileUrl = 'https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}'

function boundaryStyle(feature, selectedDistrictId, regionProgress) {
  const selected = feature.properties.TOWNCODE === selectedDistrictId
  const fill = REGION_STATUS_COLORS[getRegionStatus(regionProgress, feature.properties.TOWNCODE)].fill
  return { color: '#45494e', weight: selected ? 1 : 0.35,
    fillColor: `rgb(${fill.slice(0, 3).join(',')})`, fillOpacity: selected ? 0 : 1 }
}

function markerIcon(selected = false) {
  return L.divIcon({ className: `temple-pin${selected ? ' is-selected' : ''}`, html: '<span></span>', iconSize: [22, 27], iconAnchor: [11, 26] })
}

function clusterIcon(cluster) {
  return L.divIcon({ className: 'temple-cluster', html: `<span>${cluster.getChildCount()}</span>`, iconSize: [42, 42] })
}

export default function TaiwanTempleMap({ regionProgress, selectedCounty, selectedDistrictId, selectedDistrict, selectedTemple, selectedTempleId, temples, restoreView, onDistrictSelect, onOverviewSelect, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const boundaryRef = useRef(null)
  const layersByDistrictRef = useRef(new Map())
  const clusterRef = useRef(null)
  const markerByIdRef = useRef(new Map())
  const batchTimerRef = useRef(null)
  const lastSelectionRef = useRef(undefined)
  const callbacksRef = useRef({ onDistrictSelect, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError })
  const selectedTempleRef = useRef(selectedTempleId)
  const progressRef = useRef(regionProgress)
  const overviewCallbackRef = useRef(onOverviewSelect)
  const selectedDistrictRef = useRef(selectedDistrict)
  const [geometryReady, setGeometryReady] = useState(0)

  useEffect(() => {
    overviewCallbackRef.current = onOverviewSelect
    selectedDistrictRef.current = selectedDistrict
  }, [onOverviewSelect, selectedDistrict])

  useEffect(() => {
    callbacksRef.current = { onDistrictSelect, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError }
    selectedTempleRef.current = selectedTempleId
  }, [onDistrictSelect, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError, selectedTempleId])

  useEffect(() => {
    const map = L.map(containerRef.current, {
      zoomControl: false, scrollWheelZoom: true, touchZoom: true,
      preferCanvas: true,
      zoomAnimation: false, markerZoomAnimation: false, fadeAnimation: false,
      maxZoom: 18, minZoom: 1, zoomSnap: 0.25,
    }).setView([23.8, 121], 7)
    mapRef.current = map
    map.createPane('districtTiles').style.zIndex = 210
    map.createPane('countyBorders').style.zIndex = 450
    map.getPane('countyBorders').style.pointerEvents = 'none'
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 60, zoomToBoundsOnClick: true,
      showCoverageOnHover: false, chunkedLoading: true,
      animateAddingMarkers: false, spiderfyOnMaxZoom: true,
      iconCreateFunction: clusterIcon,
    }).addTo(map)
    clusterRef.current = cluster
    const saveView = () => callbacksRef.current.onViewChange({ center: [map.getCenter().lat, map.getCenter().lng], zoom: map.getZoom() })
    map.on('moveend', saveView)
    const returnFromSea = event => {
      if (!boundaryRef.current) return
      if (event.originalEvent?.target?.closest?.('.temple-pin, .temple-cluster, .temple-preview')) return
      const point = { longitude: event.latlng.lng, latitude: event.latlng.lat }
      if (isTempleInDistrict(point, selectedDistrictRef.current)) return
      const onLand = [...layersByDistrictRef.current.values()].some(layer =>
        layer.getBounds().contains(event.latlng) && isTempleInDistrict(point, layer.feature))
      if (!onLand) {
        map.stop()
        if (lastSelectionRef.current?.county) {
          overviewCallbackRef.current()
        } else {
          map.fitBounds(boundaryRef.current.overviewBounds, { padding: [24, 24], maxZoom: 8, animate: false })
        }
      }
    }
    map.on('click', returnFromSea)
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ pan: false })
      if (boundaryRef.current && !lastSelectionRef.current?.county) {
        map.fitBounds(boundaryRef.current.overviewBounds, { padding: [24, 24], maxZoom: 8, animate: false })
      }
    })
    observer.observe(containerRef.current)
    const markerById = markerByIdRef.current

    let mounted = true
    loadDistrictBoundaries().then(collection => {
      if (!mounted) return
      const layers = new Map()
      const boundaries = L.geoJSON(collection, {
        style: feature => boundaryStyle(feature, null, progressRef.current),
        onEachFeature: (feature, layer) => {
          const name = getCountyName(feature)
          if (!name) return
          const id = feature.properties.TOWNCODE
          layers.set(id, layer)
          layer.bindTooltip(name + feature.properties.TOWNNAME, { sticky: true })
          layer.on('mouseover', () => layer.setStyle({ weight: 0.75, color: '#45494e' }))
          layer.on('mouseout', () => layer.setStyle(boundaryStyle(feature, lastSelectionRef.current?.district, progressRef.current)))
          layer.on('click', () => callbacksRef.current.onDistrictSelect(name, id))
        },
      }).addTo(map)
      const overviewBounds = L.latLngBounds(getMainlandBounds(collection, { includePenghu: true }))
      boundaryRef.current = { boundaries, collection, overviewBounds }
      layersByDistrictRef.current = layers
      lastSelectionRef.current = undefined
      callbacksRef.current.onMapError('')
      // Route-driven camera updates run in the effect below after geometry is ready.
      setGeometryReady(value => value + 1)
    }).catch(error => { if (mounted) callbacksRef.current.onMapError(error.message || '鄉鎮市區邊界載入失敗') })
    loadCountyBorders().then(collection => {
      if (mounted) L.geoJSON(collection, { pane: 'countyBorders', interactive: false,
        style: { color: '#45494e', weight: 1.05, opacity: 1 } }).addTo(map)
    }).catch(error => { if (mounted) callbacksRef.current.onMapError(error.message || '縣市界載入失敗') })

    return () => {
      mounted = false
      clearTimeout(batchTimerRef.current)
      observer.disconnect()
      map.off('moveend', saveView)
      map.off('click', returnFromSea)
      map.remove()
      mapRef.current = null
      boundaryRef.current = null
      clusterRef.current = null
      markerById.clear()
      layersByDistrictRef.current.clear()
    }
  }, []) // Leaflet owns its DOM; route and data changes update the existing instance below.

  useEffect(() => {
    const map = mapRef.current
    const boundary = boundaryRef.current
    if (!map || !boundary) return
    const previous = lastSelectionRef.current
    if (previous?.county === selectedCounty && previous?.district === selectedDistrictId) return
    lastSelectionRef.current = { county: selectedCounty, district: selectedDistrictId }
    map.stop()
    const features = selectedCounty ? boundary.collection.features.filter(feature =>
      selectedDistrictId ? feature.properties.TOWNCODE === selectedDistrictId : getCountyName(feature) === selectedCounty
    ) : boundary.collection.features
    if (!features.length) { callbacksRef.current.onDistrictError('找不到這個鄉鎮市區'); return }
    callbacksRef.current.onDistrictError('')
    const [[west, south], [east, north]] = getCollectionBounds({ features })
    const bounds = selectedCounty ? L.latLngBounds([[south, west], [north, east]]) : boundary.overviewBounds
    if (selectedCounty && restoreView && Array.isArray(restoreView.center) && restoreView.center.every(Number.isFinite) && Number.isFinite(restoreView.zoom)) {
      map.setView(restoreView.center, restoreView.zoom, { animate: false })
    } else {
      map.fitBounds(bounds, { padding: selectedCounty ? countyPadding : [24, 24], maxZoom: selectedDistrictId ? 15 : selectedCounty ? 10 : 8, animate: false })
    }
  }, [selectedCounty, selectedDistrictId, geometryReady, restoreView])

  useEffect(() => {
    progressRef.current = regionProgress
    boundaryRef.current?.boundaries.eachLayer(layer => layer.setStyle(boundaryStyle(layer.feature, selectedDistrictId, regionProgress)))
  }, [regionProgress, selectedDistrictId, geometryReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedDistrict || !selectedDistrictId) return
    const overviewLayer = layersByDistrictRef.current.get(selectedDistrictId)
    if (overviewLayer) map.removeLayer(overviewLayer)
    const outline = L.geoJSON(selectedDistrict, { interactive: false,
      style: { color: '#45494e', weight: 1, fillOpacity: 0 } }).addTo(map)
    const pane = map.getPane('districtTiles')
    const updateClip = () => {
      const geometry = selectedDistrict.geometry
      const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
      const path = polygons.flatMap(rings => rings.map(ring => ring.map(([lng, lat], index) => {
        const point = map.latLngToLayerPoint([lat, lng])
        return `${index ? 'L' : 'M'}${point.x} ${point.y}`
      }).join(' ') + ' Z')).join(' ')
      pane.style.clipPath = `path(evenodd, "${path}")`
    }
    updateClip()
    const tiles = L.tileLayer(tileUrl, { pane: 'districtTiles', bounds: outline.getBounds(),
      attribution: '© 國土測繪圖資服務雲', maxZoom: 18, updateWhenIdle: true,
      keepBuffer: 1 }).addTo(map)
    const tileError = () => callbacksRef.current.onDistrictError('區內底圖暫時無法載入，仍可使用區界與宮廟錨點')
    tiles.on('tileerror', tileError)
    map.on('zoomend moveend viewreset resize', updateClip)
    return () => {
      map.off('zoomend moveend viewreset resize', updateClip)
      tiles.off('tileerror', tileError)
      map.removeLayer(tiles)
      map.removeLayer(outline)
      pane.style.clipPath = ''
      if (overviewLayer) overviewLayer.addTo(map)
    }
  }, [selectedDistrict, selectedDistrictId, geometryReady])

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

  return <div className="leaflet-map" ref={containerRef} aria-label="台灣鄉鎮市區與宮廟地圖" />
}
