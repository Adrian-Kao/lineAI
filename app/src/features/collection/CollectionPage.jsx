import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Camera } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { TEMPLE } from '../../data/temple.js'
import { useGame } from '../../state/GameContext.js'
import { isTempleComplete } from '../../state/gameRules.js'
import { getPhoto } from '../../services/mediaStorage.js'
import { formatTaipeiTime } from '../../utils/formatTime.js'
import AsyncStatus from '../../components/AsyncStatus.jsx'
import TempleArtwork from '../temple/TempleArtwork.jsx'

// 假設 mediaStorage.getPhoto(mediaId, userId) 回傳 Blob（找不到或非本人時回傳 null）。
// 圖鑑只讀 progress.photoRecords 與 IndexedDB，不另外保存進度。
function loadPhotoPreview(mediaId, userId, signal) {
  return getPhoto(mediaId, userId).then(blob => {
    if (signal?.aborted) return null
    if (!(blob instanceof Blob)) throw new Error('照片不存在或已被清除')
    return URL.createObjectURL(blob)
  })
}

function PhotoCard({ record, userId, retryKey, onRetry }) {
  // 以 key 區分請求，key 不符時視為載入中，避免在 effect 內同步 setState。
  const key = `${record.mediaId}:${userId}:${retryKey}`
  const [result, setResult] = useState({ key: '', status: 'loading', url: '', message: '' })
  const preview = result.key === key ? result : { status: 'loading', url: '', message: '' }

  useEffect(() => {
    const controller = new AbortController()
    let url = ''
    loadPhotoPreview(record.mediaId, userId, controller.signal)
      .then(value => { if (!controller.signal.aborted && value) { url = value; setResult({ key, status: 'ready', url, message: '' }) } })
      .catch(error => { if (!controller.signal.aborted) setResult({ key, status: 'error', url: '', message: error.message || '照片讀取失敗' }) })
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url) }
  }, [record.mediaId, userId, retryKey, key])

  return <li className="photo-card">
    <div className="photo-frame">
      {preview.status === 'ready'
        ? <img src={preview.url} alt={`${TEMPLE.name} 找點拍照`} />
        : <div className="photo-frame-status"><Camera size={30} strokeWidth={1.4} /><AsyncStatus status={preview.status} message={preview.message} onRetry={onRetry} /></div>}
    </div>
    <div className="photo-body">
      <h3>{TEMPLE.name}・找點拍照</h3>
      <p>台中市中區</p>
      <p>取得時間：{formatTaipeiTime(record.acquiredAt)}</p>
    </div>
  </li>
}

export default function CollectionPage() {
  const { progress, session } = useGame()
  const [retryKey, setRetryKey] = useState(0)
  const userId = session.profile?.userId ?? ''
  const photos = progress.photoRecords
  const complete = isTempleComplete(progress)

  return <main className="collection-page">
    <Link className="detail-back" to={ROUTES.map}><ArrowLeft size={19} />返回地圖</Link>
    <header className="stampbook-header">
      <h1>照片圖鑑</h1>
      <p className="demo-badge">DEMO 活動：{photos.length} 張任務照片</p>
    </header>

    <section aria-label="任務照片">
      <h2 className="collection-heading">任務照片</h2>
      {photos.length === 0
        ? <p className="stampbook-empty">還沒有任務照片。完成萬春宮的「找點拍照」後，保存的照片會出現在這裡。<Link to={ROUTES.temple}>前往萬春宮</Link></p>
        : <ul className="photo-grid">{photos.map(record => <PhotoCard key={record.mediaId} record={record} userId={userId} retryKey={retryKey} onRetry={() => setRetryKey(value => value + 1)} />)}</ul>}
    </section>

    <section aria-label="行政區獎勵">
      <h2 className="collection-heading">行政區文化照片</h2>
      {complete
        ? <ul className="photo-grid"><li className="photo-card is-reward">
          <div className="photo-frame"><TempleArtwork /></div>
          <div className="photo-body">
            <h3>中區 DEMO 活動路線完成</h3>
            <p>台中市中區</p>
            <p className="reward-note">文化照片待補：需使用具來源／授權的素材，尚未提供。</p>
          </div>
        </li></ul>
        : <p className="stampbook-empty">完成中區 DEMO 活動路線後，會收到一張當地文化照片（素材待補）。</p>}
    </section>
  </main>
}
