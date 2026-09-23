import { Camera, Check } from 'lucide-react'
import { MISSION_PHASES } from '../missionFlow.js'
import { useSettings } from '../../../state/SettingsContext.js'

export default function StampScene({ config, phase, onContinue, continueLabel, disabled = false }) {
  const { t } = useSettings()
  const templeName = t('experience.temple')
  const impacted = phase === MISSION_PHASES.stampImpact || phase === MISSION_PHASES.stampComplete
  const complete = phase === MISSION_PHASES.stampComplete

  return <section className={`mission-scene stamp-scene is-${phase}`} aria-labelledby="stamp-scene-title">
    <div className="mission-scene__heading">
      <span className="scene-kicker">{t(complete ? 'stampScene.certificate' : 'stampScene.acquiring')}</span>
      <h1 id="stamp-scene-title">{complete ? t('stampScene.opened', { temple: templeName }) : t('stampScene.title')}</h1>
      <p>{t(complete ? 'stampScene.saved' : 'stampScene.wait')}</p>
    </div>

    <div className="stamp-card-wrap">
      <article className="stamp-exploration-card">
        <header><span>{t('stampScene.journey')}</span><small>TEMPLE EXPLORER</small></header>
        <div className="stamp-exploration-card__body">
          <p>{t('experience.location')}</p>
          <h2>{templeName}</h2>
          <div className="stamp-impression-slot">
            <span>{t('stampScene.slot')}</span>
            {impacted && <img className="stamp-impression" src={config.stampImage} alt={t('stampScene.alt', { temple: templeName })} />}
            {phase === MISSION_PHASES.stampImpact && <span className="stamp-impact-word" aria-hidden="true">{t('stampScene.impact')}</span>}
          </div>
        </div>
        <footer>NO. WC-001</footer>
      </article>

      <div className="stamp-tool" aria-hidden="true"><span className="stamp-tool__handle" /><span className="stamp-tool__base" /></div>
    </div>

    {complete && <div className="stamp-complete-copy"><Check size={18} /><span>{t('stampScene.complete', { temple: templeName })}</span></div>}
    {complete && <button type="button" className="mission-primary-action mission-next-action" onClick={onContinue} disabled={disabled}><Camera size={20} />{continueLabel ?? t('stampScene.defaultContinue')}</button>}
  </section>
}
