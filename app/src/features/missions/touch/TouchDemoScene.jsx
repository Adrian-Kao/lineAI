import { Check, Nfc } from 'lucide-react'
import { MISSION_PHASES } from '../missionFlow.js'
import { useSettings } from '../../../state/SettingsContext.js'

export default function TouchDemoScene({ phase, onStart }) {
  const { t } = useSettings()
  const templeName = t('experience.temple')
  const detecting = phase === MISSION_PHASES.touchDetecting
  const success = phase === MISSION_PHASES.touchSuccess

  return <section className={`mission-scene touch-scene is-${phase}`} aria-labelledby="touch-scene-title">
    <div className="mission-scene__heading">
      <span className="scene-kicker">{t('touch.kicker')}</span>
      <h1 id="touch-scene-title">{t(success ? 'touch.success' : detecting ? 'touch.detecting' : 'touch.title')}</h1>
      <p>{success ? t('touch.opened', { temple: templeName }) : t(detecting ? 'touch.keepNear' : 'touch.help')}</p>
    </div>

    <div className={`touch-target${detecting ? ' is-detecting' : ''}${success ? ' is-success' : ''}`}>
      {detecting && <div className="touch-waves" aria-hidden="true"><i /><i /><i /></div>}
      <span className="touch-target__icon">{success ? <Check size={42} strokeWidth={2.5} /> : <Nfc size={50} strokeWidth={1.7} />}</span>
      <small>{success ? 'TOUCH OK' : 'LINE TOUCH'}</small>
    </div>

    {!detecting && !success && <button type="button" className="mission-primary-action" onClick={onStart}><Nfc size={20} />{t('touch.simulate')}</button>}
    {detecting && <p className="touch-scene__status" role="status">{t('touch.reading')}</p>}
    {success && <p className="touch-scene__status is-success" role="status"><Check size={17} />{t('touch.stamping')}</p>}
  </section>
}
