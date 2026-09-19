import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Stamp } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { TEMPLE } from '../../data/temple.js'
import { useGame } from '../../state/GameContext.js'
import { formatTaipeiDate } from '../../utils/formatTime.js'
import RegionCollection from './RegionCollection.jsx'
import CollectibleModal from './CollectibleModal.jsx'

function WanchunStampSlot({ record }) {
  const acquired = Boolean(record)
  const [selectedItem, setSelectedItem] = useState(null)
  const content = <>
    <span className="district-stamp-mark" aria-hidden="true">
      {acquired ? <img src={TEMPLE.stampImageUrl} alt="" /> : <Stamp size={27} strokeWidth={1.4} />}
    </span>
    <div>
      <strong>{TEMPLE.name}</strong>
      <p className={acquired ? 'collection-date' : ''}>{acquired ? formatTaipeiDate(record.acquiredAt) : '尚未取得'}</p>
      {!acquired && <Link to={ROUTES.temple}>前往蓋章</Link>}
    </div>
  </>
  return <>
    {acquired
      ? <button className="district-collectible is-acquired is-openable" type="button" onClick={() => setSelectedItem({
        kind: 'stamp', imageUrl: TEMPLE.stampImageUrl, imageAlt: '萬春宮數位印章', title: '萬春宮數位印章',
        location: '台中市・中區', date: formatTaipeiDate(record.acquiredAt), description: '完成萬春宮數位蓋章任務後取得的文化足跡。',
      })}>{content}</button>
      : <div className="district-collectible">{content}</div>}
    <CollectibleModal item={selectedItem} onClose={() => setSelectedItem(null)} />
  </>
}

export default function StampBookPage() {
  const { progress } = useGame()
  const wanchunRecord = progress.stampRecords.find(record => record.taskId === 'stamp') ?? null
  return <main className="stampbook-page collection-index-page">
    <Link className="detail-back" to={ROUTES.map}><ArrowLeft size={19} />返回地圖</Link>
    <header className="collection-index-header">
      <div><p>文化足跡</p><h1>集章簿</h1></div>
      <span className="demo-badge">已取得 {wanchunRecord ? 1 : 0} / 1 枚</span>
    </header>
    <p className="collection-index-intro">依縣市與鄉鎮市區查看數位印章。完成宮廟蓋章任務後，印章與取得時間會收進所在地區。</p>
    <RegionCollection ariaLabel="依行政區分類的印章收藏" emptyLabel="尚未開放" renderDemoDistrict={() => <WanchunStampSlot record={wanchunRecord} />} />
  </main>
}
