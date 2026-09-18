import BottomNavigation from '../components/navigation/BottomNavigation.jsx'

export default function AppLayout({ children }) {
  return <div className="app-shell">{children}<BottomNavigation /></div>
}
