import { Camera, Puzzle } from 'lucide-react'
import { useSettings } from '../../../state/SettingsContext.js'

export default function MissionTransition({ type, config }) {
  const { t } = useSettings()
  const templeName = t('experience.temple')
  const toPhoto = type === 'to-photo'
  const Icon = toPhoto ? Camera : Puzzle
  return <section className={`mission-transition ${type}`} aria-live="polite">
    {toPhoto && <div className="mission-transition__stamp-card"><img src={config.stampImage} alt="" /><span>{templeName}</span></div>}
    <div className="mission-transition__icon"><Icon size={38} /></div>
    <h1>{t(toPhoto ? 'transition.photoTitle' : 'transition.gameTitle')}</h1>
    <p>{t(toPhoto ? 'transition.photoBody' : 'transition.gameBody', { temple: templeName })}</p>
  </section>
}
