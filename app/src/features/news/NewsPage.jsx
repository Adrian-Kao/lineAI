import { CalendarDays, LockKeyhole, MapPin } from 'lucide-react'
import './news.css'

const EVENT_STAMP_COUNT = 7
const EVENT_MEMORY = {
  unlocked: false,
  imageUrl: '/occasion/Tachia_history.jpg',
  imageAlt: '大甲媽祖遶境歷史照片',
}

function LockedStampRow() {
  return <div className="news-stamp-row" aria-label={`${EVENT_STAMP_COUNT} 枚尚未解鎖的期間限定印章`}>
    {Array.from({ length: EVENT_STAMP_COUNT }, (_, index) =>
      <span className="news-locked-stamp" aria-hidden="true" key={index}>?</span>)}
  </div>
}

function EventMemory({ memory }) {
  return <div className={`news-event-memory${memory.unlocked ? ' is-unlocked' : ' is-locked'}`}>
    <span className="news-event-memory-label">活動圖鑑</span>
    {memory.unlocked
      ? <a className="news-event-memory-frame" href={memory.imageUrl} aria-label="開啟大甲媽祖遶境歷史照片">
          <img src={memory.imageUrl} alt={memory.imageAlt} />
        </a>
      : <span className="news-event-memory-frame" aria-label="活動圖鑑尚未解鎖">
          <LockKeyhole size={19} strokeWidth={1.7} aria-hidden="true" />
        </span>}
    <span className="news-event-memory-state">{memory.unlocked ? '已解鎖' : '尚未解鎖'}</span>
  </div>
}

export default function NewsPage() {
  return <main className="news-page">
    <header className="news-heading">
      <p>文化活動情報</p>
      <h1>最新消息</h1>
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
        <EventMemory memory={EVENT_MEMORY} />
      </div>

      <footer className="limited-event-stamps">
        <div><strong>期間限定印章</strong><span>完成沿途任務後依序解鎖</span></div>
        <LockedStampRow />
      </footer>
    </section>
  </main>
}
