import { Navigate, useLocation } from 'react-router'
import { useGame } from '../state/GameContext.js'
import { ROUTES } from '../config/routes.js'

export function RequireReady({ children }) {
  const { session } = useGame()
  const location = useLocation()
  const nextPath = `${location.pathname}${location.search}`
  if (session.status !== 'ready') return <Navigate to={`${ROUTES.entry}?next=${encodeURIComponent(nextPath)}`} replace />
  return children
}
