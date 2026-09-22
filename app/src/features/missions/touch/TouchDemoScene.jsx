import { Check, Nfc } from 'lucide-react'
import { MISSION_PHASES } from '../missionFlow.js'

export default function TouchDemoScene({ config, phase, onStart }) {
  const detecting = phase === MISSION_PHASES.touchDetecting
  const success = phase === MISSION_PHASES.touchSuccess

  return <section className={`mission-scene touch-scene is-${phase}`} aria-labelledby="touch-scene-title">
    <div className="mission-scene__heading">
      <span className="scene-kicker">LINE Touch・文化探索</span>
      <h1 id="touch-scene-title">{success ? '感應成功' : detecting ? '正在感應…' : '開啟宮廟探索'}</h1>
      <p>{success ? `${config.templeName}探索已開啟` : detecting ? '請讓手機保持靠近感應區' : '將手機靠近感應區，開始今天的文化任務。'}</p>
    </div>

    <div className={`touch-target${detecting ? ' is-detecting' : ''}${success ? ' is-success' : ''}`}>
      {detecting && <div className="touch-waves" aria-hidden="true"><i /><i /><i /></div>}
      <span className="touch-target__icon">{success ? <Check size={42} strokeWidth={2.5} /> : <Nfc size={50} strokeWidth={1.7} />}</span>
      <small>{success ? 'TOUCH OK' : 'LINE TOUCH'}</small>
    </div>

    {!detecting && !success && <button type="button" className="mission-primary-action" onClick={onStart}><Nfc size={20} />模擬感應</button>}
    {detecting && <p className="touch-scene__status" role="status">正在讀取宮廟探索資訊</p>}
    {success && <p className="touch-scene__status is-success" role="status"><Check size={17} />即將為你蓋上探索印章</p>}
  </section>
}
