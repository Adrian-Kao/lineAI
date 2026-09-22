import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Camera } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { CULTURAL_MEMORIES } from '../../data/culturalMemories.js'
import { loadAdministrativeRegions } from '../../services/administrativeRegions.js'
import { useGame } from '../../state/GameContext.js'
import { isCentralDistrictComplete } from '../../state/gameRules.js'
import CollectibleModal from './CollectibleModal.jsx'
import RegionCollection from './RegionCollection.jsx'

const CENTRAL_DISTRICT_MEMORY = CULTURAL_MEMORIES['66000010']

function CentralDistrictCollection({ complete }) {
  const [selectedMemory, setSelectedMemory] = useState(null)

  if (!complete) return <div className="district-collection-empty">
    <Camera size={24} strokeWidth={1.4} /><span>完成中區所有宮廟後解鎖</span><Link to={ROUTES.temple}>前往探索</Link>
  </div>

  return <div className="district-photo-list">
    <button className="district-photo-item is-reward is-openable" type="button" onClick={() => setSelectedMemory({
      kind: 'memory', ...CENTRAL_DISTRICT_MEMORY, location: '台中市・中區',
    })}>
      <div className="district-photo-frame"><img src={CENTRAL_DISTRICT_MEMORY.imageUrl} alt={CENTRAL_DISTRICT_MEMORY.imageAlt} /></div>
      <div className="district-photo-copy">
        <strong title={CENTRAL_DISTRICT_MEMORY.title}>{CENTRAL_DISTRICT_MEMORY.title}</strong>
        <p className="memory-description">{CENTRAL_DISTRICT_MEMORY.description}</p>
      </div>
    </button>
    <CollectibleModal item={selectedMemory} onClose={() => setSelectedMemory(null)} />
  </div>
}

export default function CollectionPage() {
  const { progress } = useGame()
  const centralDistrictComplete = isCentralDistrictComplete(progress)
  const acquiredCount = centralDistrictComplete ? 1 : 0
  const [totalDistricts, setTotalDistricts] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    loadAdministrativeRegions(controller.signal)
      .then(regions => setTotalDistricts(regions.reduce((total, region) => total + region.districts.length, 0)))
      .catch(error => { if (error.name !== 'AbortError') setTotalDistricts(null) })
    return () => controller.abort()
  }, [])

  return <main className="collection-page collection-index-page">
    <header className="collection-index-header">
      <div><p>文化記憶</p><h1>照片圖鑑</h1></div>
      <span className="demo-badge">已收藏 {acquiredCount}/{totalDistricts ?? '…'} 區</span>
    </header>
    <p className="collection-index-intro">完成整個鄉鎮市區的宮廟探索後，該地的文化記憶照片會收進圖鑑。</p>
    <RegionCollection collapsible ariaLabel="依行政區分類的文化記憶收藏" emptyLabel="尚未收藏" renderDemoDistrict={() => <CentralDistrictCollection complete={centralDistrictComplete} />} />
  </main>
}
