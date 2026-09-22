import { useState } from 'react'
import { CalendarDays, LockKeyhole, MapPin } from 'lucide-react'
import { useGame } from '../../state/GameContext.js'
import CollectibleModal from '../collection/CollectibleModal.jsx'
import './news.css'

const EVENT_STAMPS = ['起駕', '彰化', '西螺', '新港', '祝壽', '回程', '安座']
const EVENT_STAMP_COUNT = EVENT_STAMPS.length
const EVENT_MEMORY = {
  imageUrl: '/occasion/Tachia_history.jpg',
  imageAlt: '大甲媽祖遶境歷史照片',
}

function EventStampRow({ unlocked, onSelect }) {
  return <div className="news-stamp-row" aria-label={`${EVENT_STAMP_COUNT} 枚${unlocked ? '已解鎖' : '尚未解鎖'}的期間限定印章`}>
    {Array.from({ length: EVENT_STAMP_COUNT }, (_, index) => unlocked
      ? <button className="news-event-stamp" type="button" key={index} onClick={() => onSelect(index)} aria-label={`放大${EVENT_STAMPS[index]}印章`}><img src={`/stamps/dajia-event/route-${index + 1}.svg`} alt={`${EVENT_STAMPS[index]}印章`} /></button>
      : <span className="news-locked-stamp" aria-hidden="true" key={index}>?</span>)}
  </div>
}

function EventMemory({ memory, onSelect }) {
  return <div className={`news-event-memory${memory.unlocked ? ' is-unlocked' : ' is-locked'}`}>
    <span className="news-event-memory-label">活動圖鑑</span>
    {memory.unlocked
      ? <button className="news-event-memory-frame" type="button" onClick={onSelect} aria-label="放大大甲媽祖遶境歷史照片">
          <img src={memory.imageUrl} alt={memory.imageAlt} />
        </button>
      : <span className="news-event-memory-frame" aria-label="活動圖鑑尚未解鎖">
          <LockKeyhole size={19} strokeWidth={1.7} aria-hidden="true" />
        </span>}
    <span className="news-event-memory-state">{memory.unlocked ? '已解鎖' : '尚未解鎖'}</span>
  </div>
}

export default function NewsPage() {
  const { demoControls } = useGame()
  const [selectedCollectible, setSelectedCollectible] = useState(null)
  const eventMemory = { ...EVENT_MEMORY, unlocked: demoControls.limitedEvent }
  function openStamp(index) {
    setSelectedCollectible({
      kind: 'stamp', imageUrl: `/stamps/dajia-event/route-${index + 1}.svg`, imageAlt: `${EVENT_STAMPS[index]}印章`,
      location: '大甲媽祖遶境・期間限定', title: `${EVENT_STAMPS[index]}紀念印章`, description: `完成遶境路線第 ${index + 1} 段後取得。`,
    })
  }
  function openMemory() {
    setSelectedCollectible({
      kind: 'memory', ...EVENT_MEMORY, location: '大甲媽祖遶境・期間限定', title: '大甲媽祖遶境文化記憶',
      description: '完成期間限定遶境任務後收藏的歷史記憶。',
    })
  }
  return <main className="news-page">
    <header className="news-heading">
      <p>文化活動情報</p>
      <h1>活動</h1>
      <p>沿著節慶與香路出發，收藏期間限定的文化記憶。</p>
    </header>

    <section className="limited-event-card" aria-labelledby="dajia-event-title">
      <div className="limited-event-image">
        <img src="/occasion/Tachia.jpg" alt="大甲媽祖遶境歷史照片" />
      </div>

      <div className="limited-event-copy">
        <div className="limited-event-tags" aria-label="活動標籤">
          <span>#期間限定</span><span>#台中市</span><span>#媽祖</span>
        </div>
        <h2 id="dajia-event-title">大甲媽祖遶境</h2>
        <dl className="limited-event-meta">
          <div><dt><CalendarDays size={16} aria-hidden="true" />時間</dt><dd>2026/04/17–2026/04/25</dd></div>
          <div><dt><MapPin size={16} aria-hidden="true" />地區</dt><dd>台中・彰化・雲林・嘉義</dd></div>
        </dl>
        <EventMemory memory={eventMemory} onSelect={openMemory} />
      </div>

      <footer className="limited-event-stamps">
        <div><strong>期間限定印章</strong><span>完成沿途任務後依序解鎖</span></div>
        <EventStampRow unlocked={demoControls.limitedEvent} onSelect={openStamp} />
      </footer>
    </section>
    <CollectibleModal item={selectedCollectible} onClose={() => setSelectedCollectible(null)} />
  </main>
}
