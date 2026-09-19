import { useEffect } from 'react'
import { ArrowLeft, Flag, Landmark, MapPinned, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { DEMO_JOURNEY_EVENTS } from '../../data/journeyDemo.js'
import { useGame } from '../../state/GameContext.js'
import { useSettings } from '../../state/SettingsContext.js'
import JourneyTree from './JourneyTree.jsx'

const LEGEND = [
  { type: 'temple', icon: Landmark, label: '大廟參訪' },
  { type: 'county', icon: MapPinned, label: '縣市完成' },
  { type: 'event', icon: Sparkles, label: '期間限定活動' },
  { type: 'final', icon: Flag, label: '全台完成' },
]

export default function JournalPage() {
  const { session } = useGame()
  const { reduceMotion } = useSettings()
  const profile = session.profile
  const playerName = profile?.name?.trim() || '旅人'
  const animationKey = `${profile?.userId ?? 'demo-player'}:demo-v3`

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [])

  return <main className="journey-page">
    <header className="journey-page-header">
      <Link className="detail-back" to={ROUTES.map}><ArrowLeft size={19} />返回地圖</Link>
      <p className="journey-eyebrow">文化足跡</p>
      <h1>{playerName}的進香旅程</h1>
      <p className="journey-intro">沿著時間道路回顧拜訪宮廟、完成地區蒐集與參與限定活動的每一段記憶。</p>
      <div className="journey-legend" aria-label="事件類型">
        {LEGEND.map(({ type, icon: Icon, label }) => <span key={type} className={`is-${type}`}><Icon size={16} />{label}</span>)}
      </div>
    </header>

    <JourneyTree events={DEMO_JOURNEY_EVENTS} animationKey={animationKey} reduceMotion={reduceMotion} />
  </main>
}
