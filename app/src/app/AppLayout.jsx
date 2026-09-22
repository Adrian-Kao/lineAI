import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { ROUTES } from '../config/routes.js'
import BrandMark from '../components/common/BrandMark.jsx'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'
import HamburgerButton from '../components/navigation/HamburgerButton.jsx'
import SideDrawer from '../components/navigation/SideDrawer.jsx'

export default function AppLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  return <div className="app-shell">
    <header className="app-topbar">
      <Link className="app-brand" to={ROUTES.map} aria-label="Templore">
        <BrandMark size={30} className="app-brand__mark" />
        <span className="app-brand__word">Templore</span>
      </Link>
      <HamburgerButton onClick={() => setDrawerOpen(true)} expanded={drawerOpen} />
    </header>
    <div className="app-content">{children}</div>
    <SideDrawer open={drawerOpen} onClose={closeDrawer} />
    <BottomNavigation />
  </div>
}
