import { ArrowLeft, Camera, Check, Gamepad2, Nfc, RotateCcw, Stamp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { useSettings } from '../../state/SettingsContext.js'
import GameScene from './game/GameScene.jsx'
import {
  demoMissionConfig,
  MISSION_PHASES,
  runSceneTransition,
  runStampSequence,
  runTouchSequence,
} from './missionFlow.js'
import PhotoDemoScene from './photo/PhotoDemoScene.jsx'
import StampScene from './stamp/StampScene.jsx'
import TouchDemoScene from './touch/TouchDemoScene.jsx'
import MissionTransition from './transitions/MissionTransition.jsx'
import './missionExperience.css'

const TOUCH_PHASES = new Set([
  MISSION_PHASES.touchWaiting,
  MISSION_PHASES.touchDetecting,
  MISSION_PHASES.touchSuccess,
])
const STAMP_PHASES = new Set([
  MISSION_PHASES.stampEntering,
  MISSION_PHASES.stampImpact,
  MISSION_PHASES.stampComplete,
])
const PHOTO_PHASES = new Set([
  MISSION_PHASES.photoIntro,
  MISSION_PHASES.photoReady,
  MISSION_PHASES.photoCapturing,
  MISSION_PHASES.photoCaptured,
  MISSION_PHASES.photoComplete,
])

function currentStep(phase) {
  if (TOUCH_PHASES.has(phase) || STAMP_PHASES.has(phase) || phase === MISSION_PHASES.toPhoto) return 0
  if (PHOTO_PHASES.has(phase) || phase === MISSION_PHASES.gameTransition) return 1
  return 2
}

export default function TempleMissionExperience({ config = demoMissionConfig }) {
  const { reduceMotion, t } = useSettings()
  const templeName = t('experience.temple')
  const [phase, setPhase] = useState(MISSION_PHASES.touchWaiting)
  const sequenceRef = useRef(null)
  const step = currentStep(phase)

  useEffect(() => () => sequenceRef.current?.abort(), [])

  async function runSequence(sequence) {
    sequenceRef.current?.abort()
    const controller = new AbortController()
    sequenceRef.current = controller
    try {
      await sequence(controller.signal)
    } catch (error) {
      if (error?.name !== 'AbortError') throw error
    }
  }

  function startTouch() {
    if (phase !== MISSION_PHASES.touchWaiting) return
    runSequence(async signal => {
      await runTouchSequence({ setPhase, signal, reducedMotion: reduceMotion })
      await runStampSequence({
        setPhase,
        signal,
        reducedMotion: reduceMotion,
        onImpact: () => navigator.vibrate?.(30),
      })
    })
  }

  function moveToPhoto() {
    runSequence(signal => runSceneTransition({ destination: 'photo', setPhase, signal, reducedMotion: reduceMotion }))
  }

  function moveToGame() {
    runSequence(signal => runSceneTransition({ destination: 'game', setPhase, signal, reducedMotion: reduceMotion }))
  }

  function resetExperience() {
    sequenceRef.current?.abort()
    setPhase(MISSION_PHASES.touchWaiting)
  }

  return <main className={`mission-experience phase-${phase}`}>
    <header className="mission-experience__header">
      <Link className="mission-experience__back" to={ROUTES.temple}><ArrowLeft size={18} />{t('experience.back')}</Link>
      <div className="mission-experience__identity">
        <div><strong>{t('experience.title', { temple: templeName })}</strong><small>{t('experience.location')}</small></div>
      </div>
      <button className="mission-experience__reset" type="button" onClick={resetExperience} title={t('experience.resetTitle')}><RotateCcw size={18} /><span>{t('experience.reset')}</span></button>
    </header>

    <ol className="mission-experience__progress" aria-label={t('experience.progress')}>
      {[
        { label: t('experience.touch'), Icon: Nfc },
        { label: t('experience.photo'), Icon: Camera },
        { label: t('experience.game'), Icon: Gamepad2 },
      ].map(({ label, Icon }, index) => <li key={label} className={`${index === step ? 'is-active' : ''}${index < step ? ' is-complete' : ''}`} aria-current={index === step ? 'step' : undefined}>
        <span>{index < step ? <Check size={15} /> : index === 0 && STAMP_PHASES.has(phase) ? <Stamp size={15} /> : <Icon size={15} />}</span>
        <small>{label}</small>
      </li>)}
    </ol>

    <div className="mission-experience__stage" aria-live="polite">
      {TOUCH_PHASES.has(phase) && <TouchDemoScene config={config} phase={phase} onStart={startTouch} />}
      {STAMP_PHASES.has(phase) && <StampScene config={config} phase={phase} onContinue={moveToPhoto} />}
      {phase === MISSION_PHASES.toPhoto && <MissionTransition type="to-photo" config={config} />}
      {PHOTO_PHASES.has(phase) && <PhotoDemoScene config={config} phase={phase} onPhaseChange={setPhase} onContinue={moveToGame} reducedMotion={reduceMotion} />}
      {phase === MISSION_PHASES.gameTransition && <MissionTransition type="to-game" config={config} />}
      {phase === MISSION_PHASES.gameReady && <GameScene config={config} />}
    </div>

    <p className="mission-experience__disclaimer">{t('experience.disclaimer')}</p>
  </main>
}
