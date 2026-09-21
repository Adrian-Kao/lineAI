import { useEffect, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail, MessageCircleMore, Sprout } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useGame } from '../state/GameContext.js'
import { ROUTES } from '../config/routes.js'
import { ensureLineLogin, getLineProfile, initLine, isLineConfigured, isLineMockMode } from '../services/line.js'

function profileName(email) {
  const name = email.trim().split('@')[0]
  return name || '測試玩家'
}

export default function EntryPage() {
  const { session, initializeSession } = useGame()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState('')
  const [lineConnecting, setLineConnecting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const nextPath = new URLSearchParams(location.search).get('next')
  const returnPath = nextPath?.startsWith('/') && !nextPath.startsWith('//') ? nextPath : ROUTES.map
  const submitting = session.status === 'loading' || lineConnecting

  useEffect(() => {
    if (!isLineConfigured() || isLineMockMode()) return
    let active = true

    async function restoreSession() {
      setLineConnecting(true)
      try {
        const client = await initLine()
        if (!client?.isLoggedIn()) return
        const profile = await getLineProfile()
        if (active) await initializeSession(profile)
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'LINE 連線失敗，請再試一次')
      } finally {
        if (active) setLineConnecting(false)
      }
    }

    restoreSession()
    return () => { active = false }
  }, [initializeSession])

  async function signIn(profile) {
    if (submitting) return
    setError('')
    try {
      await initializeSession(profile)
      navigate(returnPath, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '登入失敗，請再試一次')
    }
  }

  function handleAccountLogin(event) {
    event.preventDefault()
    const account = email.trim().toLowerCase()
    signIn({ userId: `mock-account:${account || 'guest'}`, name: profileName(email), avatar: null })
  }

  async function handleLineLogin() {
    if (submitting) return
    setError('')
    setLineConnecting(true)
    try {
      await initLine()
      const redirect = new URL(ROUTES.entry, window.location.origin)
      redirect.searchParams.set('next', returnPath)
      if (!ensureLineLogin({ redirectUri: redirect.toString() })) return
      await signIn(await getLineProfile())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'LINE 登入失敗，請再試一次')
    } finally {
      setLineConnecting(false)
    }
  }

  if (session.status === 'ready') return <Navigate to={returnPath} replace />

  return <main className="login-page">
    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-brand" aria-label="Templore">
        <span className="login-brand-mark" aria-hidden="true"><Sprout size={54} strokeWidth={1.65} /></span>
        <p>Templore</p>
      </div>

      <h1 id="login-title">登入帳號</h1>

      <form className="login-form" onSubmit={handleAccountLogin}>
        <label className="login-field">
          <Mail size={22} aria-hidden="true" />
          <span className="sr-only">電子郵件或帳號</span>
          <input type="text" inputMode="email" autoComplete="username" placeholder="請輸入電子郵件或帳號" value={email} onChange={event => setEmail(event.target.value)} />
        </label>

        <label className="login-field">
          <LockKeyhole size={22} aria-hidden="true" />
          <span className="sr-only">密碼</span>
          <input type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" placeholder="請輸入密碼" value={password} onChange={event => setPassword(event.target.value)} />
          <button className="password-toggle" type="button" aria-label={passwordVisible ? '隱藏密碼' : '顯示密碼'} onClick={() => setPasswordVisible(value => !value)}>
            {passwordVisible ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </label>

        <button className="login-submit" type="submit" disabled={submitting}>{submitting ? '登入中…' : '登入'}</button>
      </form>

      <div className="login-divider"><span>其他登入方式</span></div>

      <button className="line-login" type="button" onClick={handleLineLogin} disabled={submitting}>
        <MessageCircleMore size={25} fill="currentColor" aria-hidden="true" />
        {lineConnecting ? '連接 LINE 中…' : '使用 LINE 登入'}
      </button>

      {(error || session.error) && <p className="login-error" role="alert">{error || session.error}</p>}
    </section>
  </main>
}
