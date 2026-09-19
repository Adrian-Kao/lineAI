import { useEffect, useState } from 'react'
import { Camera, ImagePlus } from 'lucide-react'
import { useGame } from '../../state/GameContext.js'
import { validateImageFile } from '../../services/image.js'
import { deletePhoto, savePhoto } from '../../services/mediaStorage.js'
import { useSettings } from '../../state/SettingsContext.js'

export default function PhotoTask({ onComplete, disabled = false }) {
  const { session } = useGame()
  const { t } = useSettings()
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0]
    setError('')
    try {
      validateImageFile(nextFile)
      setFile(nextFile)
      setPreviewUrl(URL.createObjectURL(nextFile))
      setStatus('ready')
    } catch (cause) {
      setFile(null)
      setStatus('idle')
      setError(cause instanceof Error ? cause.message : '無法讀取圖片')
    }
  }

  async function handleSave() {
    if (!file || disabled || status === 'saving') return
    setStatus('saving')
    setError('')
    let mediaId
    try {
      mediaId = await savePhoto({ ownerId: session.profile.userId, blob: file })
      await onComplete?.({ taskId: 'photo', completedAt: new Date().toISOString(), evidence: { kind: 'photo', mediaId } })
      setStatus('done')
    } catch (cause) {
      if (mediaId) await deletePhoto({ ownerId: session.profile.userId, mediaId }).catch(() => {})
      setStatus('ready')
      setError(cause instanceof Error ? cause.message : '照片保存失敗')
    }
  }

  return <section className="photo-task" aria-labelledby="photo-task-title">
    <header>
      <p className="puzzle-task__eyebrow">{t('photo.eyebrow')}</p><h2 id="photo-task-title">{t('photo.title')}</h2><p>{t('photo.description')}</p>
    </header>
    <label className="photo-picker">
      <ImagePlus size={22} />
      <span>{t(file ? 'photo.rechoose' : 'photo.choose')}</span>
      <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} disabled={disabled || status === 'saving'} />
    </label>
    {previewUrl
      ? <figure className="photo-preview"><img src={previewUrl} alt={t('photo.previewAlt')} /><figcaption>{t('photo.confirm')}</figcaption></figure>
      : <div className="photo-placeholder"><Camera size={38} /><p>{t('photo.empty')}</p></div>}
    <button type="button" className="task-button" onClick={handleSave} disabled={!file || disabled || status === 'saving'}>
      {t(status === 'saving' ? 'photo.saving' : 'photo.save')}
    </button>
    {error && <p className="mission-error" role="alert">{error}</p>}
  </section>
}
