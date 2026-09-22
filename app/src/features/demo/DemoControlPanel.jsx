import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useGame } from '../../state/GameContext.js'
import './demoControlPanel.css'

const CONTROLS = [
  { key: 'centralComplete', title: '中區完成', description: '點亮萬春宮以外的中區宮廟，取得其印章並解鎖中區圖鑑。' },
  { key: 'mapColoring', title: '全台填色', description: '套用固定的縣市完成與鄉鎮市區探索中配色。' },
  { key: 'limitedEvent', title: '期間限定', description: '完成大甲媽祖遶境七枚印章並解鎖活動圖鑑。' },
  { key: 'rewardNotifications', title: '彈跳通知', description: '依序展示印章、圖鑑、LINE POINTS 與永久貼圖。' },
  { key: 'resetAccount', title: '重製當前帳號進度', description: '清除任務、集章、圖鑑、行程與個人頭像等本機設定。', action: true },
]

export default function DemoControlPanel({ open, onClose }) {
  const { demoControls, session, setDemoControl, showDemoRewardSequence, resetCurrentAccount } = useGame()
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
      setResetMessage('當前帳號已重製')
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
        <div><p>展示工具</p><h2 id="demo-control-title">Demo 特殊面板</h2></div>
        <button ref={closeRef} type="button" aria-label="關閉" onClick={onClose}><X size={22} /></button>
      </header>
      <p className="demo-control-intro">開關會保留在此裝置，登出或切換 LINE 帳號後仍會套用。</p>
      <div className="demo-control-list">
        {CONTROLS.map(control => <label key={control.key} className={control.action ? 'is-action' : ''}>
          <span><strong>{control.title}</strong><small>{control.description}</small></span>
          <input type="checkbox" checked={control.action ? false : demoControls[control.key]} disabled={control.action && session.status !== 'ready'} onChange={event => toggleControl(control.key, event.target.checked)} />
          <i aria-hidden="true" />
        </label>)}
      </div>
      {session.status !== 'ready' && <p className="demo-control-status">登入後才能重製當前帳號。</p>}
      {resetMessage && <p className="demo-control-status is-success" role="status">{resetMessage}</p>}
    </section>
  </div>, document.body)
}
