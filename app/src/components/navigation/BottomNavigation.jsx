import { useState } from 'react'
import { NavLink } from 'react-router'
import { BookOpen, ChevronDown, ChevronUp, Stamp } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import TaiwanIcon from './TaiwanIcon.jsx'

const items = [
  { to: ROUTES.map, label: '台灣', icon: TaiwanIcon },
  { to: ROUTES.stamps, label: '集章', icon: Stamp },
  { to: ROUTES.journal, label: '手札', icon: BookOpen },
  { to: ROUTES.points, label: '點數', icon: null },
]

export default function BottomNavigation() {
  const [navExpanded, setNavExpanded] = useState(true)
  return <div className={`bottom-navigation${navExpanded ? '' : ' is-collapsed'}`}>
    <button className="nav-toggle" type="button" aria-label={navExpanded ? '收合底部導覽' : '展開底部導覽'} aria-expanded={navExpanded} onClick={() => setNavExpanded(value => !value)} title={navExpanded ? '收合導覽' : '展開導覽'}>
      {navExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
    </button>
    <nav className="nav-items" aria-label="主要導覽" inert={!navExpanded}>
      {items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`} aria-label={label} title={label}>
        {Icon ? <Icon size={27} strokeWidth={1.9} /> : <span className="points-icon" aria-hidden="true">P</span>}
        <span className="nav-label">{label}</span>
      </NavLink>)}
    </nav>
  </div>
}
