import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useGame } from '../state/GameContext.js'
import { ROUTES } from '../config/routes.js'
import { getLineProfile, initLine, ensureLineLogin } from '../services/line.js'

export default function EntryPage() {
  const { session, initializeSession } = useGame()
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const nextPath = new URLSearchParams(location.search).get('next')
  const returnPath = nextPath?.startsWith('/') && !nextPath.startsWith('//') ? nextPath : ROUTES.map

  useEffect(() => {
    let active = true
    async function startSession() {
      try {
        await initLine()
        if (!active || !ensureLineLogin()) return
        const profile = await getLineProfile()
        if (!active) return
        await initializeSession(profile)
        if (active) navigate(returnPath, { replace: true })
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'LINE 初始化失敗')
      }
    }
    startSession()
    return () => { active = false }
  }, [attempt, initializeSession, navigate, returnPath])

  if (session.status === 'ready') return <Navigate to={returnPath} replace />
  return <main className="app-shell"><h1>萬春宮文化探索</h1><p role="status">{error || session.error || '正在連接 LINE…'}</p>{(error || session.error) && <button onClick={() => { setError(''); setAttempt(value => value + 1) }}>重試</button>}</main>
}
