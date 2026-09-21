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
const overviewFitOptions = { padding: [0, 0] }
const overviewFillOpacity = 0.38
const regionAnimationDuration = 0.85
const templeAnimationDuration = 0.65
const tileUrl = 'https://wmts.nlsc.gov.tw/wmts/EMAP6/default/GoogleMapsCompatible/{z}/{y}/{x}'
// Invisible interaction boundary: Taiwan, Penghu, Kinmen and Matsu plus a
// comfortable sea margin. Leaflet clamps the map center inside this box.
const interactionBounds = L.latLngBounds([[20.4, 117], [27.2, 124]])
const landMaskTolerance = 0.001

function segmentDistanceSquared(point, start, end) {
  let x = start[0]
  let y = start[1]
  let dx = end[0] - x
  let dy = end[1] - y
  if (dx || dy) {
    const ratio = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy)
    if (ratio > 1) {
      x = end[0]
      y = end[1]
    } else if (ratio > 0) {
      x += dx * ratio
      y += dy * ratio
    }
  }
  dx = point[0] - x
  dy = point[1] - y
  return dx * dx + dy * dy
}

function simplifyOpenLine(points, toleranceSquared) {
  if (points.length <= 2) return points
  const keep = new Uint8Array(points.length)
  const stack = [[0, points.length - 1]]
  keep[0] = 1
  keep[points.length - 1] = 1
  while (stack.length) {
    const [start, end] = stack.pop()
    let furthest = toleranceSquared
    let furthestIndex = -1
    for (let index = start + 1; index < end; index += 1) {
      const distance = segmentDistanceSquared(points[index], points[start], points[end])
      if (distance > furthest) {
        furthest = distance
        furthestIndex = index
      }
    }
    if (furthestIndex > 0) {
      keep[furthestIndex] = 1
      stack.push([start, furthestIndex], [furthestIndex, end])
    }
  }
  return points.filter((_, index) => keep[index])
}

function simplifyClosedRing(ring) {
  const points = ring.slice(0, -1)
  if (points.length < 4) return ring
  let west = 0
  let east = 0
  for (let index = 1; index < points.length; index += 1) {
    if (points[index][0] < points[west][0]) west = index
    if (points[index][0] > points[east][0]) east = index
  }
  if (west > east) [west, east] = [east, west]
  const toleranceSquared = landMaskTolerance * landMaskTolerance
  const north = simplifyOpenLine(points.slice(west, east + 1), toleranceSquared)
  const south = simplifyOpenLine(points.slice(east).concat(points.slice(0, west + 1)), toleranceSquared)
  const simplified = north.concat(south.slice(1))
  simplified.push(simplified[0])
  return simplified.length >= 4 ? simplified : ring
}

function sketchLine(feature) {
  const code = String(feature.properties.TOWNCODE ?? '')
  const seed = [...code].reduce((sum, digit) => sum + Number(digit || 0), 0)
  return {
    weight: 0.92 + (seed % 3) * 0.09,
    opacity: 0.72 + (seed % 2) * 0.08,
  }
}

function boundaryStyle(feature, selectedDistrictId, regionProgress) {
  const selected = feature.properties.TOWNCODE === selectedDistrictId
  const palette = REGION_STATUS_COLORS[getRegionStatus(regionProgress, feature.properties.TOWNCODE)]
  const sketch = sketchLine(feature)
  return {
    color: `rgb(${palette.line.slice(0, 3).join(',')})`,
    weight: selected ? 1.55 : sketch.weight,
    opacity: selected ? .78 : sketch.opacity,
    lineCap: 'round',
    lineJoin: 'round',
    fillColor: `rgb(${palette.fill.slice(0, 3).join(',')})`,
    fillOpacity: selected ? 0 : selectedDistrictId ? 0.64 : overviewFillOpacity,
  }
}

function templeMarkerSvg(count = null) {
  const countLabel = count === null ? '' : `<text class="temple-cluster-count" x="22" y="31" text-anchor="middle">${count}</text>`
  return `<svg class="temple-marker" viewBox="0 0 44 58" aria-hidden="true"><ellipse class="temple-shadow" cx="22" cy="53" rx="17" ry="4"/><circle class="temple-halo" cx="22" cy="28" r="20"/><path class="temple-ridge" d="M22 5v6M18 9h8M7 20c5 0 9-3 15-9 6 6 10 9 15 9l-4 5H11Z"/><path class="temple-roof" d="M4 23c7 0 12-3 18-9 6 6 11 9 18 9l-5 7H9Z"/><path class="temple-roof-trim" d="M9 29h26l-2 5H11Z"/><path class="temple-building" d="M12 34h20v15H12Z"/><path class="temple-door" d="M18 37h8v12h-8Z"/><path class="temple-pillars" d="M12 34h4v15h-4ZM28 34h4v15h-4Z"/><path class="temple-base" d="M9 49h26l3 4H6Z"/><path class="temple-detail" d="M20 40h4M22 38v10M8 25h28"/>${countLabel}</svg>`
}

function markerIcon(selected = false, completed = false) {
  return L.divIcon({ className: 'temple-pin' + (completed ? ' is-lit' : '') + (selected ? ' is-selected' : ''),
    html: templeMarkerSvg(), iconSize: [54, 70], iconAnchor: [27, 66] })
}

function clusterIcon(cluster) {
  const lit = cluster.getAllChildMarkers().every(marker => marker.options.completedTemple)
  return L.divIcon({ className: 'temple-cluster' + (lit ? ' is-lit' : ''),
    html: templeMarkerSvg(cluster.getChildCount()), iconSize: [58, 72], iconAnchor: [29, 68] })
}

export default function TaiwanTempleMap({ completedTempleIds, regionProgress, selectedCounty, selectedDistrictId, selectedDistrict, selectedTemple, selectedTempleId, temples, restoreView, onDistrictSelect, onOverviewSelect, onZoomBack, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const boundaryRef = useRef(null)
  const layersByDistrictRef = useRef(new Map())
  const clusterRef = useRef(null)
  const markerByIdRef = useRef(new Map())
  const batchTimerRef = useRef(null)
  const districtClickTimerRef = useRef(null)
  const lastSelectionRef = useRef(undefined)
  const lastTempleRef = useRef(null)
  const callbacksRef = useRef({ onDistrictSelect, onZoomBack, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError })
  const selectedTempleRef = useRef(selectedTempleId)
  const completedTempleRef = useRef(completedTempleIds)
  const progressRef = useRef(regionProgress)
  const overviewCallbackRef = useRef(onOverviewSelect)
  const selectedDistrictRef = useRef(selectedDistrict)
  const [geometryReady, setGeometryReady] = useState(0)

  useEffect(() => {
    overviewCallbackRef.current = onOverviewSelect
    selectedDistrictRef.current = selectedDistrict
  }, [onOverviewSelect, selectedDistrict])

  useEffect(() => {
    callbacksRef.current = { onDistrictSelect, onZoomBack, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError }
    selectedTempleRef.current = selectedTempleId
    completedTempleRef.current = completedTempleIds
  }, [onDistrictSelect, onZoomBack, onTempleSelect, onViewChange, onTemplePositionChange, onMapError, onDistrictError, selectedTempleId, completedTempleIds])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reduceMotion === 'true'
    const map = L.map(containerRef.current, {
      zoomControl: false, attributionControl: false, scrollWheelZoom: true, touchZoom: true,
      doubleClickZoom: false,
      preferCanvas: true,
      zoomAnimation: !prefersReducedMotion, markerZoomAnimation: !prefersReducedMotion, fadeAnimation: !prefersReducedMotion,
      maxZoom: 18, minZoom: 1, zoomSnap: 0.1,
      maxBounds: interactionBounds, maxBoundsViscosity: 1,
    }).setView([23.8, 121], 7)
    mapRef.current = map
    map.attributionControl = L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map)
    const districtTilesPane = map.createPane('districtTiles')
    districtTilesPane.style.zIndex = 210
    districtTilesPane.classList.add('district-tiles-pane')
    map.createPane('countyBackdrop').style.zIndex = 445
    map.getPane('countyBackdrop').style.pointerEvents = 'none'
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
      if (selectedTempleRef.current) return
      const point = { longitude: event.latlng.lng, latitude: event.latlng.lat }
      if (isTempleInDistrict(point, selectedDistrictRef.current)) return
      const onLand = [...layersByDistrictRef.current.values()].some(layer =>
        layer.getBounds().contains(event.latlng) && isTempleInDistrict(point, layer.feature))
      if (!onLand) {
        map.stop()
        if (lastSelectionRef.current?.county) {
          overviewCallbackRef.current()
        } else {
          map.fitBounds(boundaryRef.current.overviewBounds, { ...overviewFitOptions, maxZoom: 8, animate: false })
        }
      }
    }
    map.on('click', returnFromSea)
    const zoomBack = event => {
      if (event.originalEvent?.target?.closest?.('.temple-pin, .temple-cluster, .temple-preview, .county-tools')) return
      if (!selectedTempleRef.current && !lastSelectionRef.current?.county) return
      clearTimeout(districtClickTimerRef.current)
      L.DomEvent.stop(event.originalEvent)
      callbacksRef.current.onZoomBack()
    }
    map.on('dblclick', zoomBack)
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ pan: false })
      if (boundaryRef.current && !lastSelectionRef.current?.county) {
        map.setMinZoom(Math.min(8, map.getBoundsZoom(boundaryRef.current.overviewBounds, false, [0, 0])))
        map.fitBounds(boundaryRef.current.overviewBounds, { ...overviewFitOptions, maxZoom: 8, animate: false })
      }
    })
    observer.observe(containerRef.current)
    const markerById = markerByIdRef.current

    let mounted = true
    let baseTiles = null
    let updateLandClip = null
    let landClipTimer = null
    let cancelLandClip = null
    let scheduleLandClip = null
    const tileError = () => callbacksRef.current.onDistrictError('底圖暫時無法載入，仍可使用區界與宮廟錨點')
    loadDistrictBoundaries().then(collection => {
      if (!mounted) return
      const layers = new Map()
      const boundaries = L.geoJSON(collection, {
        bubblingMouseEvents: false,
        style: feature => boundaryStyle(feature, null, progressRef.current),
        onEachFeature: (feature, layer) => {
          const name = getCountyName(feature)
          if (!name) return
          const id = feature.properties.TOWNCODE
          layers.set(id, layer)
          layer.bindTooltip(name + feature.properties.TOWNNAME, { sticky: true })
          layer.on('click', event => {
            clearTimeout(districtClickTimerRef.current)
            if (event.originalEvent?.detail > 1) return
            districtClickTimerRef.current = setTimeout(() => callbacksRef.current.onDistrictSelect(name, id), 240)
          })
        },
      }).addTo(map)
      const overviewBounds = L.latLngBounds(getMainlandBounds(collection, { includePenghu: true }))
      boundaryRef.current = { boundaries, collection, overviewBounds }
      const pane = map.getPane('districtTiles')
      const landPolygons = collection.features.flatMap(feature => {
        const geometry = feature.geometry
        const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
        return polygons.map(rings => ({
          rings: rings.map(simplifyClosedRing),
          bounds: L.latLngBounds(rings[0].map(([lng, lat]) => [lat, lng])),
        }))
      })
      updateLandClip = () => {
        const visibleBounds = map.getBounds().pad(0.2)
        const path = landPolygons.filter(polygon => polygon.bounds.intersects(visibleBounds)).flatMap(({ rings }) => rings.map(ring => ring.map(([lng, lat], index) => {
          const point = map.latLngToLayerPoint([lat, lng])
          return `${index ? 'L' : 'M'}${point.x} ${point.y}`
        }).join(' ') + ' Z')).join(' ')
        pane.style.clipPath = `path(evenodd, "${path}")`
      }
      cancelLandClip = () => {
        clearTimeout(landClipTimer)
        landClipTimer = null
      }
      scheduleLandClip = () => {
        cancelLandClip()
        landClipTimer = setTimeout(() => {
          landClipTimer = null
          updateLandClip()
        }, 120)
      }
      updateLandClip()
      baseTiles = L.tileLayer(tileUrl, { pane: 'districtTiles', bounds: boundaries.getBounds(),
        attribution: '© 國土測繪圖資服務雲', maxZoom: 18, updateWhenIdle: true,
        keepBuffer: 1, opacity: .78, className: 'district-base-tile' }).addTo(map)
      baseTiles.on('tileerror', tileError)
      map.on('moveend resize', scheduleLandClip)
      map.on('movestart zoomstart', cancelLandClip)
      map.setMinZoom(Math.min(8, map.getBoundsZoom(overviewBounds, false, [0, 0])))
      layersByDistrictRef.current = layers
      lastSelectionRef.current = undefined
      callbacksRef.current.onMapError('')
      // Route-driven camera updates run in the effect below after geometry is ready.
      setGeometryReady(value => value + 1)
    }).catch(error => { if (mounted) callbacksRef.current.onMapError(error.message || '鄉鎮市區邊界載入失敗') })
    loadCountyBorders().then(collection => {
      if (mounted) {
        L.geoJSON(collection, { pane: 'countyBackdrop', interactive: false,
          style: { color: '#f7f2e4', weight: 5.2, opacity: .82, lineCap: 'round', lineJoin: 'round' } }).addTo(map)
        L.geoJSON(collection, { pane: 'countyBorders', interactive: false,
          style: { color: '#777b78', weight: 2.2, opacity: .82, lineCap: 'round', lineJoin: 'round' } }).addTo(map)
      }
    }).catch(error => { if (mounted) callbacksRef.current.onMapError(error.message || '縣市界載入失敗') })

    return () => {
      mounted = false
      clearTimeout(batchTimerRef.current)
      clearTimeout(districtClickTimerRef.current)
      observer.disconnect()
      map.off('moveend', saveView)
      map.off('click', returnFromSea)
      map.off('dblclick', zoomBack)
      if (updateLandClip) {
        cancelLandClip()
        map.off('moveend resize', scheduleLandClip)
        map.off('movestart zoomstart', cancelLandClip)
      }
      if (baseTiles) baseTiles.off('tileerror', tileError)
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
      const fitOptions = selectedCounty ? { padding: countyPadding } : overviewFitOptions
      const maxZoom = selectedDistrictId ? 15 : selectedCounty ? 10 : 8
      if (previous && (previous.county || selectedCounty)) {
        map.flyToBounds(bounds, { ...fitOptions, maxZoom, duration: regionAnimationDuration })
      } else {
        map.fitBounds(bounds, { ...fitOptions, maxZoom, animate: false })
      }
    }
  }, [selectedCounty, selectedDistrictId, geometryReady, restoreView])

  useEffect(() => {
    progressRef.current = regionProgress
    boundaryRef.current?.boundaries.eachLayer(layer => layer.setStyle(boundaryStyle(layer.feature, selectedDistrictId, regionProgress)))
  }, [regionProgress, selectedDistrictId, geometryReady])

  useEffect(() => {
    const map = mapRef.current
    const boundary = boundaryRef.current
    if (!map || !boundary || !selectedDistrict || !selectedDistrictId) return
    const overviewLayer = layersByDistrictRef.current.get(selectedDistrictId)
    if (overviewLayer) map.removeLayer(overviewLayer)
    const selectionRenderer = L.svg({ padding: 0.5 })
    const outline = L.geoJSON(selectedDistrict, { interactive: false, renderer: selectionRenderer,
      className: 'selected-district-shape',
      style: { color: '#666d69', weight: 1.6, opacity: .9,
        lineCap: 'round', lineJoin: 'round', fillOpacity: 0 } }).addTo(map)
    return () => {
      map.removeLayer(outline)
      // Unmount removes the map first; only restore the overview layer while it still exists.
      if (overviewLayer && mapRef.current === map) overviewLayer.addTo(map)
    }
  }, [selectedDistrict, selectedDistrictId, geometryReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const previousTempleId = lastTempleRef.current
    lastTempleRef.current = selectedTemple?.id ?? null
    if (!selectedTemple) {
      if (previousTempleId) {
        if (restoreView && Array.isArray(restoreView.center) && restoreView.center.every(Number.isFinite) && Number.isFinite(restoreView.zoom)) {
          map.flyTo(restoreView.center, restoreView.zoom, { duration: templeAnimationDuration })
        } else {
          const boundary = boundaryRef.current
          const features = boundary?.collection.features.filter(feature => selectedDistrictId
            ? feature.properties.TOWNCODE === selectedDistrictId
            : getCountyName(feature) === selectedCounty)
          if (features?.length) {
            const [[west, south], [east, north]] = getCollectionBounds({ features })
            map.flyToBounds(L.latLngBounds([[south, west], [north, east]]), {
              padding: countyPadding, maxZoom: selectedDistrictId ? 15 : 10, duration: templeAnimationDuration,
            })
          }
        }
      }
      return
    }
    const latLng = L.latLng(selectedTemple.latitude, selectedTemple.longitude)
    map.flyTo(latLng, Math.max(map.getZoom(), 15), { duration: templeAnimationDuration })
    const selectedMarker = L.marker(latLng, {
      icon: markerIcon(true, completedTempleIds.has(selectedTemple.id)), interactive: false, zIndexOffset: 1000,
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
  }, [selectedTemple, selectedCounty, selectedDistrictId, completedTempleIds, geometryReady, restoreView])

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
        const marker = L.marker([temple.latitude, temple.longitude], { icon: markerIcon(temple.id === selectedTempleRef.current, completedTempleRef.current.has(temple.id)), completedTemple: completedTempleRef.current.has(temple.id), title: temple.name })
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
    markerByIdRef.current.forEach((marker, id) => {
      marker.options.completedTemple = completedTempleIds.has(id)
      marker.setIcon(markerIcon(id === selectedTempleId, completedTempleIds.has(id)))
    })
    clusterRef.current?.refreshClusters()
  }, [selectedTempleId, temples, completedTempleIds])

  return <div className="leaflet-map" ref={containerRef} aria-label="台灣鄉鎮市區與宮廟地圖" />
}
