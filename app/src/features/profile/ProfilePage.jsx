import { useRef, useState } from 'react'
import { ArrowLeft, Camera, LogOut, RotateCcw, Save, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { useGame } from '../../state/GameContext.js'
import { useSettings } from '../../state/SettingsContext.js'

const MAX_AVATAR_FILE_BYTES = 8 * 1024 * 1024
const AVATAR_SIZE = 512

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('無法讀取頭像圖片')) }
    image.src = url
  })
}

async function createAvatarDataUrl(file) {
  if (!file?.type.startsWith('image/')) throw new Error('請選擇圖片檔案')
  if (file.size > MAX_AVATAR_FILE_BYTES) throw new Error('頭像原圖不可超過 8 MB')
  const image = await loadImage(file)
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight)
  if (!sourceSize) throw new Error('頭像圖片尺寸不正確')
  const sourceX = (image.naturalWidth - sourceSize) / 2
  const sourceY = (image.naturalHeight - sourceSize) / 2
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE
  const context = canvas.getContext('2d')
  context.fillStyle = '#fffefa'
  context.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE)
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, AVATAR_SIZE, AVATAR_SIZE)
  return canvas.toDataURL('image/jpeg', 0.86)
}

export default function ProfilePage() {
  const { session, updateProfile, signOut } = useGame()
  const { t } = useSettings()
  const profile = session.profile
  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [avatar, setAvatar] = useState(profile.avatar)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const fileInputRef = useRef(null)

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setMessage('')
    try {
      setAvatar(await createAvatarDataUrl(file))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '無法處理頭像')
    } finally {
      event.target.value = ''
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('saving')
    setMessage('')
    try {
      const saved = updateProfile({ name, phone, avatar })
      setName(saved.name)
      setPhone(saved.phone)
      setAvatar(saved.avatar)
      setStatus('saved')
      setMessage(t('profile.saved'))
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '個人資料保存失敗')
    }
  }

  function handleLogout() {
    signOut()
    window.location.replace(ROUTES.entry)
  }

  return <main className="profile-page">
    <Link className="detail-back" to={ROUTES.map}><ArrowLeft size={19} />{t('common.backMap')}</Link>
    <header className="profile-heading">
      <p>{t('profile.eyebrow')}</p>
      <h1>{t('profile.title')}</h1>
      <p>{t('profile.description')}</p>
    </header>

    <form className="profile-card" onSubmit={handleSubmit}>
      <section className="profile-avatar-section" aria-label={t('profile.avatar')}>
        <div className="profile-avatar">
          {avatar ? <img src={avatar} alt="目前的大頭照" /> : <UserRound size={58} />}
        </div>
        <div className="profile-avatar-actions">
          <button type="button" className="task-button" onClick={() => fileInputRef.current?.click()}><Camera size={18} />{t('profile.replaceAvatar')}</button>
          {avatar !== profile.lineAvatar && <button type="button" className="task-button is-secondary" onClick={() => setAvatar(profile.lineAvatar)}><RotateCcw size={17} />{t('profile.restoreAvatar')}</button>}
          <input ref={fileInputRef} className="profile-file-input" type="file" accept="image/*" onChange={handleAvatarChange} />
          <p>{t('profile.avatarHelp')}</p>
        </div>
      </section>

      <div className="profile-fields">
        <label>{t('profile.name')}<input value={name} onChange={event => setName(event.target.value)} maxLength={40} autoComplete="name" required /></label>
        <label>{t('profile.lineId')}<input value={profile.userId} readOnly aria-describedby="line-id-note" /></label>
        <p className="profile-field-note" id="line-id-note">{t('profile.lineIdHelp')}</p>
        <label>{t('profile.phone')}<input value={phone} onChange={event => setPhone(event.target.value)} type="text" inputMode="tel" maxLength={24} autoComplete="tel" placeholder={t('profile.phonePlaceholder')} /></label>
      </div>

      <button className="task-button profile-save" type="submit" disabled={status === 'saving'}><Save size={18} />{t(status === 'saving' ? 'profile.saving' : 'profile.save')}</button>
      {message && <p className={`profile-message is-${status}`} role={status === 'error' ? 'alert' : 'status'}>{message}</p>}
    </form>
    <div className="profile-logout-row">
      <button className="profile-logout" type="button" onClick={handleLogout}><LogOut size={18} />{t('profile.logout')}</button>
    </div>
  </main>
}
