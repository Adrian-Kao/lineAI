import { useEffect, useState } from 'react'
import { Camera, ImagePlus } from 'lucide-react'
import { useGame } from '../../state/GameContext.js'
import { validateImageFile } from '../../services/image.js'
import { deletePhoto, savePhoto } from '../../services/mediaStorage.js'

export default function PhotoTask({ onComplete, disabled = false }) {
  const { session } = useGame()
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
      <p className="puzzle-task__eyebrow">宮廟找點</p>
      <h2 id="photo-task-title">拍照補上文化場景</h2>
      <p>DEMO 版可拍照或從裝置選取圖片，確認後會保存在這台裝置。</p>
    </header>
    <label className="photo-picker">
      <ImagePlus size={22} />
      <span>{file ? '重新選擇照片' : '拍照或選擇照片'}</span>
      <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} disabled={disabled || status === 'saving'} />
    </label>
    {previewUrl
      ? <figure className="photo-preview"><img src={previewUrl} alt="準備保存的萬春宮任務照片" /><figcaption>請確認照片後完成任務</figcaption></figure>
      : <div className="photo-placeholder"><Camera size={38} /><p>尚未選擇照片</p></div>}
    <button type="button" className="task-button" onClick={handleSave} disabled={!file || disabled || status === 'saving'}>
      {status === 'saving' ? '儲存中…' : '保存照片並完成任務'}
    </button>
    {error && <p className="mission-error" role="alert">{error}</p>}
  </section>
}
