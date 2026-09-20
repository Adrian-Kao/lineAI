import { useState } from 'react'
import { NavLink } from 'react-router'
import { BookOpen, ChevronDown, ChevronUp, Images, Stamp } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import TaiwanIcon from './TaiwanIcon.jsx'
import { useSettings } from '../../state/SettingsContext.js'

const items = [
  { to: ROUTES.map, labelKey: 'nav.taiwan', icon: TaiwanIcon },
  { to: ROUTES.stamps, labelKey: 'nav.stamps', icon: Stamp },
  { to: ROUTES.collection, labelKey: 'nav.collection', icon: Images },
  { to: ROUTES.journal, labelKey: 'nav.journal', icon: BookOpen },
  { to: ROUTES.points, labelKey: 'nav.points', icon: null },
]

export default function BottomNavigation() {
  const { t } = useSettings()
  const [navExpanded, setNavExpanded] = useState(true)
  return <div className={`bottom-navigation${navExpanded ? '' : ' is-collapsed'}`}>
    <button className="nav-toggle" type="button" aria-label={t(navExpanded ? 'nav.collapse' : 'nav.expand')} aria-expanded={navExpanded} onClick={() => setNavExpanded(value => !value)} title={t(navExpanded ? 'nav.collapse' : 'nav.expand')}>
      {navExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
    </button>
    <nav className="nav-items" aria-label={t('nav.main')} inert={!navExpanded}>
      {items.map(({ to, labelKey, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`} aria-label={t(labelKey)} title={t(labelKey)}>
        {Icon ? <Icon size={27} strokeWidth={1.9} /> : <span className="points-icon" aria-hidden="true">P</span>}
        <span className="nav-label">{t(labelKey)}</span>
      </NavLink>)}
    </nav>
  </div>
}
