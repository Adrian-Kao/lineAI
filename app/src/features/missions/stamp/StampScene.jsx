import { Camera, Check } from 'lucide-react'
import { MISSION_PHASES } from '../missionFlow.js'

export default function StampScene({ config, phase, onContinue }) {
  const impacted = phase === MISSION_PHASES.stampImpact || phase === MISSION_PHASES.stampComplete
  const complete = phase === MISSION_PHASES.stampComplete

  return <section className={`mission-scene stamp-scene is-${phase}`} aria-labelledby="stamp-scene-title">
    <div className="mission-scene__heading">
      <span className="scene-kicker">{complete ? '探索憑證' : '正在取得印章'}</span>
      <h1 id="stamp-scene-title">{complete ? `${config.templeName}探索已開啟` : '宮廟印章蓋印中'}</h1>
      <p>{complete ? '專屬印章已留在探索卡上。' : '感應成功，請稍候片刻。'}</p>
    </div>

    <div className="stamp-card-wrap">
      <article className="stamp-exploration-card">
        <header><span>文化行旅</span><small>TEMPLE EXPLORER</small></header>
        <div className="stamp-exploration-card__body">
          <p>{config.location}</p>
          <h2>{config.templeName}</h2>
          <div className="stamp-impression-slot">
            <span>探索章位</span>
            {impacted && <img className="stamp-impression" src={config.stampImage} alt={`${config.templeName}朱紅印章`} />}
            {phase === MISSION_PHASES.stampImpact && <span className="stamp-impact-word" aria-hidden="true">啪！</span>}
          </div>
        </div>
        <footer>NO. DEMO-001</footer>
      </article>

      <div className="stamp-tool" aria-hidden="true"><span className="stamp-tool__handle" /><span className="stamp-tool__base" /></div>
    </div>

    {complete && <div className="stamp-complete-copy"><Check size={18} /><span>{config.templeName}探索印章已取得</span></div>}
    {complete && <button type="button" className="mission-primary-action" onClick={onContinue}><Camera size={20} />開始拍照探索</button>}
  </section>
}
