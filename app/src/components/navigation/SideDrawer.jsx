import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { X } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'

const links = [
  { to: ROUTES.news, label: '最新消息' },
  { to: ROUTES.settings, label: '設定' },
  { to: ROUTES.friends, label: '好友' },
  { to: ROUTES.profile, label: '個人資料' },
]

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
      <nav aria-label="其他頁面">{links.map(link => <Link key={link.to} to={link.to} onClick={onClose}>{link.label}</Link>)}</nav>
    </aside>
  </div>
}
