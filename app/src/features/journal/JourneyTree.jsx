import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Flag, Landmark, MapPinned, Sparkles } from 'lucide-react'
import { formatTaipeiDate } from '../../utils/formatTime.js'
import { buildJourneyRoadPath, buildJourneyTree, getJourneyStageWidth, JOURNEY_LAYOUT } from '../../utils/journeyTree.js'

const ICONS = { temple: Landmark, county: MapPinned, event: Sparkles, final: Flag }
const TYPE_LABELS = { temple: '宮廟參訪', county: '縣市完成', event: '限定活動', final: '旅程終點' }
const ANIMATION_DURATION = 30000
const TRAVEL_PORTION = .5
const FOOTPRINTS = '👣　'.repeat(280)

function branchPath(event) {
  const targetY = event.route === 'top' ? JOURNEY_LAYOUT.topY : JOURNEY_LAYOUT.bottomY
  const bend = event.route === 'top' ? -42 : 42
  return `M ${event.x} ${event.mainY} C ${event.x + 12} ${event.mainY + bend}, ${event.x - 12} ${targetY - bend}, ${event.x} ${targetY}`
}

function eventDelay(eventCount, index) {
  return `${Math.round(((index + TRAVEL_PORTION) / eventCount) * ANIMATION_DURATION)}ms`
}

function findLengthAtX(path, targetX, totalLength) {
  let low = 0
  let high = totalLength
  for (let index = 0; index < 15; index += 1) {
    const middle = (low + high) / 2
    if (path.getPointAtLength(middle).x < targetX) low = middle
    else high = middle
  }
  return (low + high) / 2
}

export default function JourneyTree({ events, animationKey, reduceMotion = false }) {
  const tree = useMemo(() => buildJourneyTree(events), [events])
  const stageWidth = getJourneyStageWidth(tree.length)
  const roadPath = useMemo(() => buildJourneyRoadPath(tree, stageWidth), [stageWidth, tree])
  const viewportRef = useRef(null)
  const roadRef = useRef(null)
  const travelerRef = useRef(null)
  const lockRef = useRef(null)
  const storageKey = `journey-tree-seen:${animationKey}`
  const [phase, setPhase] = useState(() => reduceMotion || localStorage.getItem(storageKey) === '1' ? 'complete' : 'playing')
  const [revealed, setRevealed] = useState(phase === 'complete' ? tree.length : 0)

  useEffect(() => {
    if (phase !== 'playing') return undefined
    const viewport = viewportRef.current
    const road = roadRef.current
    const traveler = travelerRef.current
    if (!road || !traveler || !tree.length) return undefined
    const previousOverflow = document.body.style.overflow
    let frame = 0
    let startTime = 0
    const totalLength = road.getTotalLength()
    const eventLengths = tree.map(event => findLengthAtX(road, event.x, totalLength))
    document.body.style.overflow = 'hidden'
    lockRef.current?.focus()
    const blockKeys = event => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Tab', ' '].includes(event.key)) event.preventDefault()
    }
    window.addEventListener('keydown', blockKeys, true)
    function animate(timestamp) {
      startTime ||= timestamp
      const progress = Math.min(1, (timestamp - startTime) / ANIMATION_DURATION)
      const timelinePosition = Math.min(tree.length - Number.EPSILON, progress * tree.length)
      const segment = Math.min(tree.length - 1, Math.floor(timelinePosition))
      const localProgress = progress === 1 ? 1 : timelinePosition - segment
      const travelProgress = Math.min(1, localProgress / TRAVEL_PORTION)
      const fromLength = segment === 0 ? 0 : eventLengths[segment - 1]
      const toLength = eventLengths[segment]
      const currentLength = fromLength + (toLength - fromLength) * travelProgress
      const point = road.getPointAtLength(currentLength)
      const isPraying = localProgress >= TRAVEL_PORTION && segment < tree.length - 1
      traveler.style.transform = `translate3d(${point.x - 20}px, ${point.y - 50}px, 0)`
      traveler.classList.toggle('is-praying', isPraying)
      road.style.strokeDashoffset = String(1 - currentLength / totalLength)
      setRevealed(Math.min(tree.length, segment + (localProgress >= TRAVEL_PORTION ? 1 : 0)))
      if (viewport) viewport.scrollLeft = Math.max(0, point.x - viewport.clientWidth * .42)
      if (progress < 1) frame = requestAnimationFrame(animate)
      else {
        localStorage.setItem(storageKey, '1')
        setPhase('complete')
        setRevealed(tree.length)
      }
    }
    frame = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', blockKeys, true)
    }
  }, [phase, storageKey, tree])

  return <div className={`journey-tree-shell is-${phase}`}>
    <div className="journey-tree-toolbar">
      <span><CalendarDays size={17} />共 {tree.length} 項旅程大事紀</span>
      <span>{phase === 'playing' ? `旅程展開中 ${revealed}/${tree.length}` : '可左右滑動回顧'}</span>
    </div>
    <div ref={viewportRef} className="journey-tree-viewport" aria-busy={phase === 'playing'} aria-label="個人旅程時間線">
      <div className="journey-tree-stage" style={{ width: stageWidth, height: JOURNEY_LAYOUT.height }}>
        <svg className="journey-tree-roads" width={stageWidth} height={JOURNEY_LAYOUT.height} aria-hidden="true">
          <defs><path id="journey-main-road" d={roadPath} /></defs>
          <path className="journey-road-shadow" d={roadPath} />
          <path ref={roadRef} className="journey-road-main" pathLength="1" d={roadPath} />
          <text className="journey-footprints"><textPath href="#journey-main-road" startOffset="8">{FOOTPRINTS}</textPath></text>
          {tree.slice(0, -1).map(event => <path key={event.id} className="journey-road-branch" pathLength="1" d={branchPath(event)} style={{ '--event-delay': eventDelay(tree.length, event.index) }} />)}
        </svg>
        {tree.map(event => {
          const Icon = ICONS[event.type] ?? Sparkles
          const cardTop = event.route === 'top' ? 24 : event.route === 'bottom' ? 432 : 197
          return <article key={event.id} className={`journey-event is-${event.type} is-${event.route}`} style={{ left: event.x - 76, top: cardTop, '--event-delay': eventDelay(tree.length, event.index) }}>
            {event.imageUrl && <img src={event.imageUrl} alt="" />}
            <span className="journey-event-icon"><Icon size={20} strokeWidth={1.8} /></span>
            <span className="journey-event-type">{TYPE_LABELS[event.type]}</span>
            <h3>{event.title}</h3>
            <time dateTime={event.occurredAt}>{formatTaipeiDate(event.occurredAt)}</time>
          </article>
        })}
        {tree.slice(0, -1).map(event => <span key={`junction-${event.id}`} className="journey-junction" style={{ left: event.x - 5, top: event.mainY - 5, '--event-delay': eventDelay(tree.length, event.index) }} />)}
        {tree.map(event => <span key={`node-${event.id}`} className={`journey-node is-${event.type}`} style={{ left: event.x - 7, top: (event.route === 'top' ? JOURNEY_LAYOUT.topY : event.route === 'bottom' ? JOURNEY_LAYOUT.bottomY : event.mainY) - 7, '--event-delay': eventDelay(tree.length, event.index) }} />)}
        <div ref={travelerRef} className="journey-pilgrim" aria-hidden="true">
          <span className="journey-pilgrim-walk">🚶</span><span className="journey-pilgrim-pray">🙏</span>
          <span className="journey-incense"><i /><i /><i /><b /></span>
        </div>
      </div>
    </div>
    {phase === 'playing' && <div ref={lockRef} className="journey-animation-lock" tabIndex="-1" role="status" aria-live="polite"><span>正在展開你的文化旅程・{revealed}/{tree.length}</span></div>}
  </div>
}
