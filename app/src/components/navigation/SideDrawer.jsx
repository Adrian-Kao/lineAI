import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { UserRound, X } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { useGame } from '../../state/GameContext.js'
import { TASKS } from '../../data/temple.js'
import { getTaskStatus } from '../../state/gameRules.js'
import { useSettings } from '../../state/SettingsContext.js'

const links = [
  { to: ROUTES.news, labelKey: 'drawer.news' },
  { to: ROUTES.settings, labelKey: 'drawer.settings' },
  { to: ROUTES.friends, labelKey: 'drawer.friends' },
  { to: ROUTES.profile, labelKey: 'drawer.profile' },
]

function SessionCard({ onClose }) {
  const { session, progress } = useGame()
  const { t } = useSettings()
  const ready = session.status === 'ready'
  const completed = TASKS.filter(task => getTaskStatus(progress, task.id) === 'completed').length
  return <section className="session-card" aria-label={t('session.current')}>
    <div className="session-avatar" aria-hidden="true">{ready && session.profile.avatar ? <img src={session.profile.avatar} alt="" /> : <UserRound size={26} />}</div>
    <div className="session-body">
      <p className="session-name">{ready ? session.profile.name : t('session.disconnected')}</p>
      <p className="session-meta">{ready ? t('session.progress', { completed, total: TASKS.length }) : t('session.loginHint')}</p>
      {ready && session.profile.userId.startsWith('mock-') && <p className="demo-badge">{t('session.mock')}</p>}
    </div>
    {!ready && <Link className="task-button is-secondary session-login" to={ROUTES.entry} onClick={onClose}>{t('session.connect')}</Link>}
  </section>
}

export default function SideDrawer({ open, onClose }) {
  const { t } = useSettings()
  const closeRef = useRef(null)
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const handleKeyDown = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return <div className={`drawer-root${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
    <button className="drawer-backdrop" type="button" aria-label={t('drawer.close')} onClick={onClose} tabIndex={open ? 0 : -1} />
    <aside className="side-drawer" id="side-drawer" role="dialog" aria-modal="true" aria-label={t('drawer.navigation')} inert={!open}>
      <button className="drawer-close" type="button" aria-label={t('drawer.close')} title={t('drawer.close')} onClick={onClose} ref={closeRef}><X size={23} /></button>
      <SessionCard onClose={onClose} />
      <nav aria-label={t('drawer.other')}>{links.map(link => <Link key={link.to} to={link.to} onClick={onClose}>{t(link.labelKey)}</Link>)}</nav>
    </aside>
  </div>
}
