import { useEffect, useRef, useState } from 'react'
import { Nfc } from 'lucide-react'
import { useSettings } from '../../state/SettingsContext.js'
import StampScene from '../missions/stamp/StampScene.jsx'
import { delay, demoMissionConfig, runStampSequence } from '../missions/missionFlow.js'

const SENSING_MS = 1200

export default function StampTask({ onComplete, disabled }) {
  const { reduceMotion, t } = useSettings()
  const [step, setStep] = useState('intro')
  const [stampPhase, setStampPhase] = useState(null)
  const sequenceRef = useRef(null)
  const handedOffRef = useRef(false)

  useEffect(() => () => sequenceRef.current?.abort(), [])

  async function startSensing() {
    if (disabled || step !== 'intro') return
    sequenceRef.current?.abort()
    const controller = new AbortController()
    sequenceRef.current = controller
    handedOffRef.current = false
    setStep('sensing')

    try {
      await delay(reduceMotion ? 80 : SENSING_MS, controller.signal)
      setStep('stamping')
      await runStampSequence({
        setPhase: setStampPhase,
        signal: controller.signal,
        reducedMotion: reduceMotion,
        onImpact: () => navigator.vibrate?.(30),
      })
      setStep('done')
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setStep('intro')
        console.error('Stamp sequence failed', error)
      }
    }
  }

  function finishStamp() {
    if (disabled || step !== 'done' || handedOffRef.current) return
    handedOffRef.current = true
    onComplete?.({
      taskId: 'stamp',
      completedAt: new Date().toISOString(),
      evidence: { kind: 'stamp', mockTouchConfirmed: true },
    })
  }

  if (stampPhase) {
    return <StampScene
      config={demoMissionConfig}
      phase={stampPhase}
      onContinue={finishStamp}
      continueLabel="下一關"
      disabled={disabled}
    />
  }

  return <div className={`stamp-task is-${step}`}>
    <ol className="stamp-steps">
      <li>{t('stamp.step1')}</li><li>{t('stamp.step2')}</li><li>{t('stamp.step3')}</li>
    </ol>
    <div className="stamp-pad" aria-live="polite">
      <Nfc className="stamp-sensor-icon" size={74} strokeWidth={1.35} aria-hidden="true" />
      <p className="stamp-status">{t(`stamp.${step}`)}</p>
    </div>
    <div className="stamp-actions">
      <button type="button" className="task-button stamp-button" onClick={startSensing} disabled={disabled || step !== 'intro'}>
        <Nfc size={20} />{t(step === 'intro' ? 'stamp.start' : 'stamp.sensingButton')}
      </button>
    </div>
  </div>
}
