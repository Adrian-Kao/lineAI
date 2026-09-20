import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Camera } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { useGame } from '../../state/GameContext.js'
import { isTempleComplete } from '../../state/gameRules.js'
import { getPhoto } from '../../services/mediaStorage.js'
import { formatTaipeiDate } from '../../utils/formatTime.js'
import { CULTURAL_MEMORIES } from '../../data/culturalMemories.js'
import RegionCollection from './RegionCollection.jsx'
import CollectibleModal from './CollectibleModal.jsx'

const CENTRAL_DISTRICT_MEMORY = CULTURAL_MEMORIES['66000010']

function WanchunPhoto({ record, userId }) {
  const [preview, setPreview] = useState({ status: 'loading', url: '' })
  const [selectedItem, setSelectedItem] = useState(null)
  useEffect(() => {
    if (!record || !userId) return undefined
    let cancelled = false
    let url = ''
    getPhoto({ mediaId: record.mediaId, ownerId: userId })
      .then(blob => {
        if (!cancelled && blob instanceof Blob) {
          url = URL.createObjectURL(blob)
          setPreview({ status: 'ready', url })
        } else if (!cancelled) setPreview({ status: 'missing', url: '' })
      })
      .catch(() => { if (!cancelled) setPreview({ status: 'missing', url: '' }) })
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url) }
  }, [record, userId])
  if (!record) return null
  return <>
  <button className="district-photo-item is-openable" type="button" disabled={preview.status !== 'ready'} onClick={() => setSelectedItem({
    kind: 'photo', imageUrl: preview.url, imageAlt: '萬春宮找點拍照收藏', title: '萬春宮・找點拍照',
    location: '台中市・中區', date: formatTaipeiDate(record.acquiredAt), description: '在萬春宮完成找點拍照任務後留下的探索紀錄。',
  })}>
    <div className="district-photo-frame">
      {preview.status === 'ready' ? <img src={preview.url} alt="萬春宮找點拍照收藏" /> : <Camera size={25} strokeWidth={1.4} />}
    </div>
    <div><strong>萬春宮・找點拍照</strong><p className="collection-date">{formatTaipeiDate(record.acquiredAt)}</p></div>
  </button>
  <CollectibleModal item={selectedItem} onClose={() => setSelectedItem(null)} />
  </>
}

function CentralDistrictCollection({ photoRecord, userId, complete }) {
  const [selectedMemory, setSelectedMemory] = useState(null)
  if (!photoRecord && !complete) return <div className="district-collection-empty">
    <Camera size={24} strokeWidth={1.4} /><span>尚未取得</span><Link to={ROUTES.temple}>前往探索</Link>
  </div>
  return <div className="district-photo-list">
    <WanchunPhoto record={photoRecord} userId={userId} />
    {complete && <button className="district-photo-item is-reward is-openable" type="button" onClick={() => setSelectedMemory({
      kind: 'memory', ...CENTRAL_DISTRICT_MEMORY, location: '台中市・中區',
    })}>
      <div className="district-photo-frame"><img src={CENTRAL_DISTRICT_MEMORY.imageUrl} alt={CENTRAL_DISTRICT_MEMORY.imageAlt} /></div>
      <div className="district-photo-copy">
        <strong title={CENTRAL_DISTRICT_MEMORY.title}>{CENTRAL_DISTRICT_MEMORY.title}</strong>
        <p className="memory-description">{CENTRAL_DISTRICT_MEMORY.description}</p>
      </div>
    </button>}
    <CollectibleModal item={selectedMemory} onClose={() => setSelectedMemory(null)} />
  </div>
}

export default function CollectionPage() {
  const { progress, session } = useGame()
  const photoRecord = progress.photoRecords.find(record => record.taskId === 'photo') ?? null
  const complete = isTempleComplete(progress)
  const acquiredCount = (photoRecord ? 1 : 0) + (complete ? 1 : 0)
  return <main className="collection-page collection-index-page">
    <Link className="detail-back" to={ROUTES.map}><ArrowLeft size={19} />返回地圖</Link>
    <header className="collection-index-header">
      <div><p>旅程回憶</p><h1>照片圖鑑</h1></div>
      <span className="demo-badge">已收藏 {acquiredCount} 項</span>
    </header>
    <p className="collection-index-intro">任務照片與行政區完成獎勵會依拍攝地點收進對應的縣市及鄉鎮市區。</p>
    <RegionCollection collapsible ariaLabel="依行政區分類的照片收藏" emptyLabel="尚未開放" renderDemoDistrict={() => <CentralDistrictCollection photoRecord={photoRecord} userId={session.profile?.userId ?? ''} complete={complete} />} />
  </main>
}
