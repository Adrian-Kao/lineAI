import { useEffect, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail, MessageCircleMore } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useGame } from '../state/GameContext.js'
import { ROUTES } from '../config/routes.js'
import { ensureLineLogin, getLineProfile, initLine, isLineConfigured, isLineMockMode } from '../services/line.js'
import BrandMark from '../components/common/BrandMark.jsx'
import { useSettings } from '../state/SettingsContext.js'

function profileName(email, fallback) {
  const name = email.trim().split('@')[0]
  return name || fallback
}

export default function EntryPage() {
  const { session, initializeSession } = useGame()
  const { t } = useSettings()
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
        if (active) setError(cause instanceof Error ? cause.message : t('entry.connectionFailed'))
      } finally {
        if (active) setLineConnecting(false)
      }
    }

    restoreSession()
    return () => { active = false }
  }, [initializeSession, t])

  async function signIn(profile) {
    if (submitting) return
    setError('')
    try {
      await initializeSession(profile)
      navigate(returnPath, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('entry.signInFailed'))
    }
  }

  function handleAccountLogin(event) {
    event.preventDefault()
    const account = email.trim().toLowerCase()
    signIn({ userId: `mock-account:${account || 'guest'}`, name: profileName(email, t('entry.testPlayer')), avatar: null })
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
      setError(cause instanceof Error ? cause.message : t('entry.lineFailed'))
    } finally {
      setLineConnecting(false)
    }
  }

  if (session.status === 'ready') return <Navigate to={returnPath} replace />

  return <main className="login-page">
    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-brand" aria-label="Templore">
        <BrandMark size={70} className="login-brand-mark" />
        <p>Templore</p>
      </div>

      <h1 id="login-title">{t('entry.title')}</h1>

      <form className="login-form" onSubmit={handleAccountLogin}>
        <label className="login-field">
          <Mail size={22} aria-hidden="true" />
          <span className="sr-only">{t('entry.account')}</span>
          <input type="text" inputMode="email" autoComplete="username" placeholder={t('entry.accountPlaceholder')} value={email} onChange={event => setEmail(event.target.value)} />
        </label>

        <label className="login-field">
          <LockKeyhole size={22} aria-hidden="true" />
          <span className="sr-only">{t('entry.password')}</span>
          <input type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" placeholder={t('entry.passwordPlaceholder')} value={password} onChange={event => setPassword(event.target.value)} />
          <button className="password-toggle" type="button" aria-label={t(passwordVisible ? 'entry.hidePassword' : 'entry.showPassword')} onClick={() => setPasswordVisible(value => !value)}>
            {passwordVisible ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </label>

        <button className="login-submit" type="submit" disabled={submitting}>{t(submitting ? 'entry.signingIn' : 'entry.signIn')}</button>
      </form>

      <div className="login-divider"><span>{t('entry.other')}</span></div>

      <button className="line-login" type="button" onClick={handleLineLogin} disabled={submitting}>
        <MessageCircleMore size={25} fill="currentColor" aria-hidden="true" />
        {t(lineConnecting ? 'entry.connecting' : 'entry.line')}
      </button>

      {(error || session.error) && <p className="login-error" role="alert">{error || session.error}</p>}
    </section>
  </main>
}
