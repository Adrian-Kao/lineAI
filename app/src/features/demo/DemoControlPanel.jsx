import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useGame } from '../../state/GameContext.js'
import { useSettings } from '../../state/SettingsContext.js'
import './demoControlPanel.css'

const CONTROLS = [
  { key: 'centralComplete', titleKey: 'demo.central.title', descriptionKey: 'demo.central.description' },
  { key: 'mapColoring', titleKey: 'demo.map.title', descriptionKey: 'demo.map.description' },
  { key: 'limitedEvent', titleKey: 'demo.event.title', descriptionKey: 'demo.event.description' },
  { key: 'rewardNotifications', titleKey: 'demo.rewards.title', descriptionKey: 'demo.rewards.description' },
  { key: 'resetAccount', titleKey: 'demo.reset.title', descriptionKey: 'demo.reset.description', action: true },
]

export default function DemoControlPanel({ open, onClose }) {
  const { demoControls, session, setDemoControl, showDemoRewardSequence, resetCurrentAccount } = useGame()
  const { t } = useSettings()
  const closeRef = useRef(null)
  const [resetMessage, setResetMessage] = useState('')

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  function toggleControl(key, checked) {
    if (key === 'resetAccount') {
      if (!checked || session.status !== 'ready') return
      resetCurrentAccount()
      setResetMessage(t('demo.resetDone'))
      return
    }
    setDemoControl(key, checked)
    if (key === 'rewardNotifications' && checked) {
      onClose()
      showDemoRewardSequence()
    }
  }

  return createPortal(<div className="demo-control-layer" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="demo-control-panel" role="dialog" aria-modal="true" aria-labelledby="demo-control-title">
      <header>
        <div><p>{t('demo.eyebrow')}</p><h2 id="demo-control-title">{t('demo.title')}</h2></div>
        <button ref={closeRef} type="button" aria-label={t('demo.close')} onClick={onClose}><X size={22} /></button>
      </header>
      <p className="demo-control-intro">{t('demo.intro')}</p>
      <div className="demo-control-list">
        {CONTROLS.map(control => <label key={control.key} className={control.action ? 'is-action' : ''}>
          <span><strong>{t(control.titleKey)}</strong><small>{t(control.descriptionKey)}</small></span>
          <input type="checkbox" checked={control.action ? false : demoControls[control.key]} disabled={control.action && session.status !== 'ready'} onChange={event => toggleControl(control.key, event.target.checked)} />
          <i aria-hidden="true" />
        </label>)}
      </div>
      {session.status !== 'ready' && <p className="demo-control-status">{t('demo.loginReset')}</p>}
      {resetMessage && <p className="demo-control-status is-success" role="status">{resetMessage}</p>}
    </section>
  </div>, document.body)
}
