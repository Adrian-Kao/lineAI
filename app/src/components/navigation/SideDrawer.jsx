import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { UserRound, X } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { useGame } from '../../state/GameContext.js'
import { TASKS } from '../../data/temple.js'
import { getTaskStatus } from '../../state/gameRules.js'

const links = [
  { to: ROUTES.stampbook, label: '集章簿' },
  { to: ROUTES.collection, label: '照片圖鑑' },
  { to: ROUTES.news, label: '最新消息' },
  { to: ROUTES.settings, label: '設定' },
  { to: ROUTES.friends, label: '好友' },
  { to: ROUTES.profile, label: '個人資料' },
]

function SessionCard({ onClose }) {
  const { session, progress } = useGame()
  const ready = session.status === 'ready'
  const completed = TASKS.filter(task => getTaskStatus(progress, task.id) === 'completed').length
  return <section className="session-card" aria-label="目前玩家">
    <div className="session-avatar" aria-hidden="true">{ready && session.profile.avatar ? <img src={session.profile.avatar} alt="" /> : <UserRound size={26} />}</div>
    <div className="session-body">
      <p className="session-name">{ready ? session.profile.name : '尚未連接 LINE'}</p>
      <p className="session-meta">{ready ? `萬春宮任務 ${completed}／${TASKS.length}` : '進入任務時會請你登入'}</p>
      {ready && session.profile.userId.startsWith('mock-') && <p className="demo-badge">本機模擬登入</p>}
    </div>
    {!ready && <Link className="task-button is-secondary session-login" to={ROUTES.entry} onClick={onClose}>連接 LINE</Link>}
  </section>
}

export default function SideDrawer({ open, onClose }) {
  const closeRef = useRef(null)
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const handleKeyDown = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return <div className={`drawer-root${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
    <button className="drawer-backdrop" type="button" aria-label="關閉選單" onClick={onClose} tabIndex={open ? 0 : -1} />
    <aside className="side-drawer" id="side-drawer" role="dialog" aria-modal="true" aria-label="導覽選單" inert={!open}>
      <button className="drawer-close" type="button" aria-label="關閉選單" title="關閉選單" onClick={onClose} ref={closeRef}><X size={23} /></button>
      <SessionCard onClose={onClose} />
      <nav aria-label="其他頁面">{links.map(link => <Link key={link.to} to={link.to} onClick={onClose}>{link.label}</Link>)}</nav>
    </aside>
  </div>
}
