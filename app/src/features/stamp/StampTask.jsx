import { useEffect, useRef, useState } from 'react'
import { Nfc } from 'lucide-react'
import { TEMPLE } from '../../data/temple.js'
import { useSettings } from '../../state/SettingsContext.js'

// 流程：說明 → 模擬感應（DEMO，不連接真實硬體）→ 蓋章動畫 → 交由 MissionPage 保存。
// 動畫結束後才呼叫 onComplete；保存失敗時父層顯示錯誤，使用者可重新感應。
const SENSING_MS = 1200
const STAMP_MS = 900
const SAVED_HINT_MS = 700

export default function StampTask({ onComplete, disabled }) {
  const { t } = useSettings()
  const [step, setStep] = useState('intro') // intro | sensing | stamping | done
  const [handedOff, setHandedOff] = useState(false) // 已呼叫 onComplete；父層若保存失敗可重新感應
  const timerRef = useRef(null)
  const completeRef = useRef(onComplete)
  useEffect(() => { completeRef.current = onComplete }, [onComplete])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  function startSensing() {
    if (disabled || step !== 'intro') return
    setHandedOff(false)
    setStep('sensing')
    timerRef.current = setTimeout(() => setStep('stamping'), SENSING_MS)
  }

  useEffect(() => {
    if (step !== 'stamping') return
    timerRef.current = setTimeout(() => setStep('done'), STAMP_MS)
    return () => clearTimeout(timerRef.current)
  }, [step])

  useEffect(() => {
    if (step !== 'done') return
    // 讓「已蓋章」停留一下再保存，保存完成由 MissionPage 導向故事頁。
    timerRef.current = setTimeout(() => {
      setHandedOff(true)
      completeRef.current({ taskId: 'stamp', completedAt: new Date().toISOString(), evidence: { kind: 'stamp', mockTouchConfirmed: true } })
    }, SAVED_HINT_MS)
    return () => clearTimeout(timerRef.current)
  }, [step])

  return <div className={`stamp-task is-${step}`}>
    <p className="demo-badge">{t('stamp.demo')}</p>
    <ol className="stamp-steps">
      <li>{t('stamp.step1')}</li><li>{t('stamp.step2')}</li><li>{t('stamp.step3')}</li>
    </ol>
    <div className="stamp-pad" aria-live="polite">
      <div className="stamp-mark" aria-hidden="true">
        <img src={TEMPLE.stampImageUrl} alt="" />
      </div>
      <p className="stamp-status">
        {t(`stamp.${step}`)}
      </p>
    </div>
    <div className="stamp-actions">
      <button type="button" className="task-button stamp-button" onClick={startSensing} disabled={disabled || step !== 'intro'}>
        <Nfc size={20} />{t(step === 'intro' ? 'stamp.start' : step === 'sensing' ? 'stamp.sensingButton' : 'stamp.finishedButton')}
      </button>
      {step === 'done' && handedOff && !disabled && <button type="button" className="task-button is-secondary" onClick={() => setStep('intro')}>{t('stamp.retry')}</button>}
    </div>
  </div>
}
