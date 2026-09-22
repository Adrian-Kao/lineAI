import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { UserRound, X } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { useGame } from '../../state/GameContext.js'
import { TASKS } from '../../data/temple.js'
import { getTaskStatus } from '../../state/gameRules.js'
import { useSettings } from '../../state/SettingsContext.js'
import DemoControlPanel from '../../features/demo/DemoControlPanel.jsx'

const links = [
  { to: ROUTES.news, labelKey: 'drawer.news' },
  { to: ROUTES.friends, labelKey: 'drawer.friends' },
  { to: ROUTES.profile, labelKey: 'drawer.profile' },
]

function SessionCard({ onClose, onOpenDemoControls }) {
  const { session, progress } = useGame()
  const { t } = useSettings()
  const ready = session.status === 'ready'
  const completed = TASKS.filter(task => getTaskStatus(progress, task.id) === 'completed').length
  return <section className="session-card" aria-label={t('session.current')}>
    <button className="session-avatar" type="button" aria-label="個人頭像" onClick={() => { onClose(); onOpenDemoControls() }}>{ready && session.profile.avatar ? <img src={session.profile.avatar} alt="" /> : <UserRound size={26} />}</button>
    <div className="session-body">
      <p className="session-name">{ready ? session.profile.name : t('session.disconnected')}</p>
      <p className="session-meta">{ready ? t('session.progress', { completed, total: TASKS.length }) : t('session.loginHint')}</p>
    </div>
    {!ready && <Link className="task-button is-secondary session-login" to={ROUTES.entry} onClick={onClose}>{t('session.connect')}</Link>}
  </section>
}

export default function SideDrawer({ open, onClose }) {
  const { language, setSetting, t } = useSettings()
  const [demoPanelOpen, setDemoPanelOpen] = useState(false)
  const closeRef = useRef(null)
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const handleKeyDown = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return <><div className={`drawer-root${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
    <button className="drawer-backdrop" type="button" aria-label={t('drawer.close')} onClick={onClose} tabIndex={open ? 0 : -1} />
    <aside className="side-drawer" id="side-drawer" role="dialog" aria-modal="true" aria-label={t('drawer.navigation')} inert={!open}>
      <button className="drawer-close" type="button" aria-label={t('drawer.close')} title={t('drawer.close')} onClick={onClose} ref={closeRef}><X size={23} /></button>
      <SessionCard onClose={onClose} onOpenDemoControls={() => setDemoPanelOpen(true)} />
      <nav aria-label={t('drawer.other')}>{links.map(link => <Link key={link.to} to={link.to} onClick={onClose}>{t(link.labelKey)}</Link>)}</nav>
      <div className="drawer-language-options" role="radiogroup" aria-label={t('settings.language')}>
        <label>
          <input type="radio" name="drawer-language" value="zh-TW" checked={language === 'zh-TW'} onChange={() => setSetting('language', 'zh-TW')} />
          <span>中文</span>
        </label>
        <label>
          <input type="radio" name="drawer-language" value="en" checked={language === 'en'} onChange={() => setSetting('language', 'en')} />
          <span>English</span>
        </label>
      </div>
    </aside>
  </div><DemoControlPanel open={demoPanelOpen} onClose={() => setDemoPanelOpen(false)} /></>
}
