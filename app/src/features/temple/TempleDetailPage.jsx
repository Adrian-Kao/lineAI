import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { toDisplayCountyName } from '../../utils/countyNames.js'
import { loadTempleById } from '../../services/templeData.js'
import { templeContentById, missionEnabledTempleIds } from '../../data/templeContent.js'
import TempleArtwork from './TempleArtwork.jsx'
import { useGame } from '../../state/GameContext.js'
import { TASKS } from '../../data/temple.js'
import { getTaskStatus, isTempleCompleted } from '../../state/gameRules.js'
import { formatTaipeiTime } from '../../utils/formatTime.js'
import { useSettings } from '../../state/SettingsContext.js'
import {
  localizedValue,
  localizeDeity,
  localizeReligion,
  localizeTempleName,
} from '../../utils/templeLocalization.js'
import ItineraryAction from '../itinerary/ItineraryAction.jsx'

// 目前只有萬春宮參與活動，任務紀錄直接對應 progress；多宮廟時需依宮廟 ID 區分。
function recordLine(temple, progress, t) {
  if (!missionEnabledTempleIds.has(temple.id)) return t('temple.notInDemo')
  const completed = TASKS.filter(task => getTaskStatus(progress, task.id) === 'completed')
  if (!completed.length) return t('temple.noRecord')
  const latest = progress.missionCompletions[completed.at(-1).id].completedAt
  return t('temple.record', {
    completed: completed.length,
    total: TASKS.length,
    time: formatTaipeiTime(latest),
  })
}

export default function TempleDetailPage() {
  const { county, uuid } = useParams()
  const { progress } = useGame()
  const { language, t } = useSettings()
  const location = useLocation()
  const [result, setResult] = useState({ key: '', temple: null, error: '' })
  const displayCounty = toDisplayCountyName(county)
  const key = `${displayCounty}:${uuid}`

  useEffect(() => {
    const controller = new AbortController()
    loadTempleById(displayCounty, uuid, controller.signal)
      .then(temple => { if (!controller.signal.aborted) setResult({ key, temple, error: temple ? '' : t('temple.notFound') }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ key, temple: null, error: error.message }) })
    return () => controller.abort()
  }, [displayCounty, uuid, key, t])

  const temple = result.key === key ? result.temple : null
  const content = temple ? templeContentById[temple.id] : null
  const templeName = temple ? localizeTempleName(temple, content, language) : ''
  const history = localizedValue(content?.history, language)
  const features = localizedValue(content?.features, language)
  const contentSources = content?.contentSources?.map(source => localizedValue(source, language)).filter(Boolean) ?? []
  const imageCredit = localizedValue(content?.imageCredit, language)
  const returningToItinerary = Boolean(location.state?.fromItinerary)
  return <main className="temple-detail-page">
    {returningToItinerary && <Link className="detail-back" to={ROUTES.itinerary}><ArrowLeft size={19} />{t('itinerary.back')}</Link>}
    {result.key !== key && <p role="status">{t('temple.loading')}</p>}
    {result.key === key && result.error && <p role="alert">{result.error}</p>}
    {temple && <article className="temple-detail">
      {content?.image ? <img src={content.image} alt={templeName} /> : <TempleArtwork />}
      <h1>{templeName}</h1>
      <dl>
        <div><dt>{t('temple.religion')}</dt><dd>{localizeReligion(temple.religion, language, content)}</dd></div>
        {temple.deity && <div><dt>{t('temple.deity')}</dt><dd>{localizeDeity(temple.deity, language, content)}</dd></div>}
        {temple.address && <div><dt>{t('temple.address')}</dt><dd>{temple.address}</dd></div>}
        {temple.phone && <div><dt>{t('temple.phone')}</dt><dd>{temple.phone}</dd></div>}
      </dl>
      {history && <section><h2>{t('temple.history')}</h2><p>{history}</p></section>}
      {features && <section><h2>{t('temple.features')}</h2><p>{features}</p></section>}
      {contentSources.length > 0 && <p>{t('temple.additionalSources', { sources: contentSources.join('、') })}</p>}
      {imageCredit && <p>{t('temple.imageSource', { source: imageCredit })}</p>}
      {temple.sourceUrl.startsWith('https://kiang.github.io/religion/data/poi/') && <p className="source-line">{t('temple.dataSource')}<a href={temple.sourceUrl} target="_blank" rel="noreferrer">{t('temple.publicData')}</a></p>}
      <p className="record-line">{recordLine(temple, progress, t)}</p>
      <ItineraryAction temple={temple} completed={isTempleCompleted(progress, temple.id)} />
      {missionEnabledTempleIds.has(temple.id) && <Link className="task-button explore-button" to={ROUTES.temple}>{t('temple.explore')}</Link>}
    </article>}
  </main>
}
