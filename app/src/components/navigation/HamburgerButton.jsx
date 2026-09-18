import { Menu } from 'lucide-react'

export default function HamburgerButton({ onClick, expanded }) {
  return <button className="hamburger-button" type="button" aria-label="開啟選單" aria-expanded={expanded} aria-controls="side-drawer" onClick={onClick} title="開啟選單"><Menu size={24} strokeWidth={2} /></button>
}
