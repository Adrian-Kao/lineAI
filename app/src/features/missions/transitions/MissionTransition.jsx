import { Camera, Puzzle } from 'lucide-react'

export default function MissionTransition({ type, config }) {
  const toPhoto = type === 'to-photo'
  const Icon = toPhoto ? Camera : Puzzle
  return <section className={`mission-transition ${type}`} aria-live="polite">
    {toPhoto && <div className="mission-transition__stamp-card"><img src={config.stampImage} alt="" /><span>{config.templeName}</span></div>}
    <div className="mission-transition__icon"><Icon size={38} /></div>
    <h1>{toPhoto ? '準備拍照探索' : '遊戲載入中…'}</h1>
    <p>{toPhoto ? `留下你在${config.templeName}的探索紀錄` : `準備進入${config.templeName}小挑戰`}</p>
  </section>
}
