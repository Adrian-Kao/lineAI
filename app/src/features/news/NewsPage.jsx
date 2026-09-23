import { useState } from 'react'
import { CalendarDays, LockKeyhole, MapPin } from 'lucide-react'
import { useGame } from '../../state/GameContext.js'
import { useSettings } from '../../state/SettingsContext.js'
import CollectibleModal from '../collection/CollectibleModal.jsx'
import './news.css'

const EVENT_STAMP_COUNT = 7
const EVENT_MEMORY = {
  imageUrl: '/occasion/Tachia_history.jpg',
  imageAlt: '大甲媽祖遶境歷史照片',
}

function EventStampRow({ unlocked, onSelect, stampNames, t }) {
  return <div className="news-stamp-row" aria-label={t('news.stampRow', { count: EVENT_STAMP_COUNT, state: t(unlocked ? 'news.unlocked' : 'news.locked') })}>
    {Array.from({ length: EVENT_STAMP_COUNT }, (_, index) => unlocked
      ? <button className="news-event-stamp" type="button" key={index} onClick={() => onSelect(index)} aria-label={t('news.stampZoom', { stamp: stampNames[index] })}><img src={`/stamps/dajia-event/route-${index + 1}.svg`} alt={t('news.stampAlt', { stamp: stampNames[index] })} /></button>
      : <span className="news-locked-stamp" aria-hidden="true" key={index}>?</span>)}
  </div>
}

function EventMemory({ memory, onSelect, t }) {
  return <div className={`news-event-memory${memory.unlocked ? ' is-unlocked' : ' is-locked'}`}>
    <span className="news-event-memory-label">{t('news.memory')}</span>
    {memory.unlocked
      ? <button className="news-event-memory-frame" type="button" onClick={onSelect} aria-label={t('news.memoryZoom')}>
          <img src={memory.imageUrl} alt={memory.imageAlt} />
        </button>
      : <span className="news-event-memory-frame" aria-label={t('news.memoryLocked')}>
          <LockKeyhole size={19} strokeWidth={1.7} aria-hidden="true" />
        </span>}
    <span className="news-event-memory-state">{t(memory.unlocked ? 'news.unlocked' : 'news.locked')}</span>
  </div>
}

export default function NewsPage() {
  const { demoControls } = useGame()
  const { t } = useSettings()
  const [selectedCollectible, setSelectedCollectible] = useState(null)
  const stampNames = Array.from({ length: EVENT_STAMP_COUNT }, (_, index) => t(`news.stamp.${index}`))
  const eventMemory = { ...EVENT_MEMORY, imageAlt: t('news.imageAlt'), unlocked: demoControls.limitedEvent }
  function openStamp(index) {
    setSelectedCollectible({
      kind: 'stamp', imageUrl: `/stamps/dajia-event/route-${index + 1}.svg`, imageAlt: t('news.stampAlt', { stamp: stampNames[index] }),
      location: t('news.eventLocation'), title: t('news.stampTitle', { stamp: stampNames[index] }), description: t('news.stampDescription', { number: index + 1 }),
    })
  }
  function openMemory() {
    setSelectedCollectible({
      kind: 'memory', ...EVENT_MEMORY, imageAlt: t('news.imageAlt'), location: t('news.eventLocation'), title: t('news.memoryTitle'),
      description: t('news.memoryDescription'),
    })
  }
  return <main className="news-page">
    <header className="news-heading">
      <p>{t('news.eyebrow')}</p>
      <h1>{t('news.title')}</h1>
      <p>{t('news.intro')}</p>
    </header>

    <section className="limited-event-card" aria-labelledby="dajia-event-title">
      <div className="limited-event-image">
        <img src="/occasion/Tachia.jpg" alt={t('news.imageAlt')} />
      </div>

      <div className="limited-event-copy">
        <div className="limited-event-tags" aria-label={t('news.tags')}>
          <span>{t('news.limited')}</span><span>{t('news.taichung')}</span><span>{t('news.mazu')}</span>
        </div>
        <h2 id="dajia-event-title">{t('news.eventTitle')}</h2>
        <dl className="limited-event-meta">
          <div><dt><CalendarDays size={16} aria-hidden="true" />{t('news.time')}</dt><dd>2026/04/17–2026/04/25</dd></div>
          <div><dt><MapPin size={16} aria-hidden="true" />{t('news.region')}</dt><dd>{t('news.regions')}</dd></div>
        </dl>
        <EventMemory memory={eventMemory} onSelect={openMemory} t={t} />
      </div>

      <footer className="limited-event-stamps">
        <div><strong>{t('news.stamps')}</strong><span>{t('news.stampsHelp')}</span></div>
        <EventStampRow unlocked={demoControls.limitedEvent} onSelect={openStamp} stampNames={stampNames} t={t} />
      </footer>
    </section>
    <CollectibleModal item={selectedCollectible} onClose={() => setSelectedCollectible(null)} />
  </main>
}
