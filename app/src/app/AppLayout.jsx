import { useCallback, useState } from 'react'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'
import HamburgerButton from '../components/navigation/HamburgerButton.jsx'
import SideDrawer from '../components/navigation/SideDrawer.jsx'

export default function AppLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  return <div className="app-shell">
    {children}
    <HamburgerButton onClick={() => setDrawerOpen(true)} expanded={drawerOpen} />
    <SideDrawer open={drawerOpen} onClose={closeDrawer} />
    <BottomNavigation />
  </div>
}
