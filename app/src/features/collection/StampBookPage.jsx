import { Link } from 'react-router'
import { ArrowLeft, Stamp } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { TEMPLE } from '../../data/temple.js'
import { useGame } from '../../state/GameContext.js'
import { formatTaipeiTime } from '../../utils/formatTime.js'

// 集章簿完全由 progress.stampRecords 生成，不另外保存進度。
// DEMO 活動只有萬春宮一個蓋章點；其餘格子為未開放的空位，不代表真實宮廟。
const EMPTY_SLOTS = 5

function StampSlot({ temple, record }) {
  if (!temple) return <li className="stamp-slot is-empty" aria-label="尚未開放的空格"><span className="stamp-slot-mark" aria-hidden="true" /><p>尚未開放</p></li>
  const acquired = Boolean(record)
  return <li className={`stamp-slot${acquired ? ' is-acquired' : ''}`}>
    <span className="stamp-slot-mark" aria-hidden="true">{acquired ? <><Stamp size={30} strokeWidth={1.6} /><span>{temple.name}</span></> : <Stamp size={30} strokeWidth={1.4} />}</span>
    <h3>{temple.name}</h3>
    <p>{acquired ? formatTaipeiTime(record.acquiredAt) : '尚未取得'}</p>
    {!acquired && <Link className="stamp-slot-link" to={ROUTES.temple}>前往蓋章</Link>}
  </li>
}

export default function StampBookPage() {
  const { progress } = useGame()
  // 目前蓋章任務只屬於萬春宮；有多間宮廟時需在紀錄中加入宮廟 ID。
  const wanchunRecord = progress.stampRecords.find(record => record.taskId === 'stamp') ?? null
  const acquiredCount = wanchunRecord ? 1 : 0

  return <main className="stampbook-page">
    <Link className="detail-back" to={ROUTES.map}><ArrowLeft size={19} />返回地圖</Link>
    <header className="stampbook-header">
      <h1>集章簿</h1>
      <p className="demo-badge">DEMO 活動：已取得 {acquiredCount} / 1 枚印章</p>
    </header>
    {acquiredCount === 0 && <p className="stampbook-empty">還沒有任何印章。到萬春宮完成數位蓋章，印章會出現在這裡。</p>}
    <ol className="stamp-grid" aria-label="印章列表">
      <StampSlot temple={TEMPLE} record={wanchunRecord} />
      {Array.from({ length: EMPTY_SLOTS }, (_, index) => <StampSlot key={index} />)}
    </ol>
  </main>
}
