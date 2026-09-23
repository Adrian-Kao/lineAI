import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Map, Route } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { loadTempleById } from '../../services/templeData.js'
import { useGame } from '../../state/GameContext.js'
import { selectItineraryItems } from '../../state/gameRules.js'
import { useSettings } from '../../state/SettingsContext.js'
import ItineraryList from './ItineraryList.jsx'
import './itinerary.css'

function LoadingCards({ label }) {
  return <div className="itinerary-list" aria-label={label}>
    {[0, 1].map(index => <div className="itinerary-skeleton" key={index} aria-hidden="true"><span /><div><i /><i /><i /></div></div>)}
  </div>
}

export default function ItineraryPage() {
  const { progress, removeTempleFromItinerary } = useGame()
  const { t } = useSettings()
  const items = useMemo(() => selectItineraryItems(progress), [progress])
  const itemsKey = items.map(item => `${item.templeId}:${item.county}:${item.addedAt}`).join('|')
  const [data, setData] = useState({ key: '', records: [], loading: false })

  useEffect(() => {
    if (!items.length) return undefined
    const controller = new AbortController()
    Promise.all(items.map(async item => {
      try {
        const temple = await loadTempleById(item.county, item.templeId, controller.signal)
        return { item, temple }
      } catch (error) {
        if (error?.name === 'AbortError') throw error
        return { item, temple: null }
      }
    })).then(records => {
      if (!controller.signal.aborted) setData({ key: itemsKey, records, loading: false })
    }).catch(error => {
      if (!controller.signal.aborted && error?.name !== 'AbortError') setData({ key: itemsKey, records: items.map(item => ({ item, temple: null })), loading: false })
    })
    return () => controller.abort()
  }, [items, itemsKey])

  const activeData = data.key === itemsKey ? data : { records: [], loading: true }
  return <main className="itinerary-page">
    <header className="itinerary-header">
      <div className="itinerary-header__icon"><Route size={27} /></div>
      <div><p>{t('itinerary.eyebrow')}</p><h1>{t('itinerary.title')}</h1><span>{t('itinerary.subtitle')}</span></div>
    </header>

    {!items.length
      ? <section className="itinerary-empty">
        <CalendarDays size={34} />
        <h2>{t('itinerary.emptyTitle')}</h2>
        <p>{t('itinerary.emptyBody')}</p>
        <Link className="task-button" to={ROUTES.map}><Map size={18} />{t('itinerary.goMap')}</Link>
      </section>
      : <>
        <p className="itinerary-count">{t('itinerary.count', { count: items.length })}</p>
        {activeData.loading ? <LoadingCards label={t('itinerary.loading')} /> : <ItineraryList records={activeData.records} onRemove={removeTempleFromItinerary} />}
      </>}
  </main>
}
