import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Camera } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { CULTURAL_MEMORIES } from '../../data/culturalMemories.js'
import { loadAdministrativeRegions } from '../../services/administrativeRegions.js'
import { useGame } from '../../state/GameContext.js'
import { isCentralDistrictComplete } from '../../state/gameRules.js'
import { useSettings } from '../../state/SettingsContext.js'
import CollectibleModal from './CollectibleModal.jsx'
import RegionCollection from './RegionCollection.jsx'

const CENTRAL_DISTRICT_MEMORY = CULTURAL_MEMORIES['66000010']

function CentralDistrictCollection({ complete, t }) {
  const [selectedMemory, setSelectedMemory] = useState(null)
  const memory = {
    ...CENTRAL_DISTRICT_MEMORY,
    title: t('collection.centralTitle'), description: t('collection.centralDescription'),
    imageAlt: t('collection.centralImageAlt'), sourceNote: t('collection.centralSource'),
  }

  if (!complete) return <div className="district-collection-empty">
    <Camera size={24} strokeWidth={1.4} /><span>{t('collection.unlockCentral')}</span><Link to={ROUTES.temple}>{t('collection.explore')}</Link>
  </div>

  return <div className="district-photo-list">
    <button className="district-photo-item is-reward is-openable" type="button" onClick={() => setSelectedMemory({
      kind: 'memory', ...memory, location: t('collection.centralLocation'),
    })}>
      <div className="district-photo-frame"><img src={memory.imageUrl} alt={memory.imageAlt} /></div>
      <div className="district-photo-copy">
        <strong title={memory.title}>{memory.title}</strong>
        <p className="memory-description">{memory.description}</p>
      </div>
    </button>
    <CollectibleModal item={selectedMemory} onClose={() => setSelectedMemory(null)} />
  </div>
}

export default function CollectionPage() {
  const { progress, demoControls } = useGame()
  const { t } = useSettings()
  const centralDistrictComplete = isCentralDistrictComplete(progress) || demoControls.centralComplete
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
      <div><p>{t('collection.eyebrow')}</p><h1>{t('collection.title')}</h1></div>
      <span className="demo-badge">{t('collection.collected', { count: acquiredCount, total: totalDistricts ?? '…' })}</span>
    </header>
    <p className="collection-index-intro">{t('collection.intro')}</p>
    <RegionCollection collapsible ariaLabel={t('collection.aria')} emptyLabel={t('collection.empty')} renderDemoDistrict={() => <CentralDistrictCollection complete={centralDistrictComplete} t={t} />} />
  </main>
}
