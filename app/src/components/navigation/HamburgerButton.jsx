import { Menu } from 'lucide-react'
import { useSettings } from '../../state/SettingsContext.js'

export default function HamburgerButton({ onClick, expanded }) {
  const { t } = useSettings()
  return <button className="hamburger-button" type="button" aria-label={t('drawer.open')} aria-expanded={expanded} aria-controls="side-drawer" onClick={onClick} title={t('drawer.open')}><Menu size={24} strokeWidth={2} /></button>
}
