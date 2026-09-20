import { Link } from 'react-router'
import { ArrowLeft, Camera, Check, Lock, Puzzle, Stamp } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { TASKS, TEMPLE } from '../../data/temple.js'
import { useGame } from '../../state/GameContext.js'
import { getNextTaskId, getTaskStatus, isTempleComplete } from '../../state/gameRules.js'
import { formatTaipeiTime } from '../../utils/formatTime.js'
import TempleArtwork from './TempleArtwork.jsx'
import { useSettings } from '../../state/SettingsContext.js'

// 萬春宮位於台中市中區；與 MapPage 使用的區碼一致，讓返回地圖時回到同一個區。
const DEMO_COUNTY = '台中市'
const DEMO_DISTRICT_CODE = '66000010'
const backToMap = `${ROUTES.county.replace(':county', encodeURIComponent(DEMO_COUNTY))}?district=${DEMO_DISTRICT_CODE}`

const TASK_ICONS = { stamp: Stamp, photo: Camera, puzzle: Puzzle }
// 只描述操作方式，不放文化內容；故事由 STORIES 提供。
function TaskCard({ task, status, completion, t }) {
  const Icon = TASK_ICONS[task.type]
  return <li className={`task-card is-${status}`}>
    <div className="task-icon" aria-hidden="true">{status === 'completed' ? <Check size={22} /> : status === 'locked' ? <Lock size={20} /> : <Icon size={22} />}</div>
    <div className="task-body">
      <p className="task-order">{t('task.label', { order: task.order })}<span className="task-status">{t(`task.${status}`)}</span></p>
      <h3>{t(`task.${task.id}`)}</h3>
      <p className="task-hint">{status === 'completed' && completion ? t('task.completedAt', { time: formatTaipeiTime(completion.completedAt) }) : t(`temple.hint.${task.id}`)}</p>
    </div>
    <div className="task-action">
      {status === 'available' && <Link className="task-button" to={ROUTES.mission.replace(':taskId', task.id)}>{t('task.start')}</Link>}
      {status === 'completed' && <Link className="task-button is-secondary" to={ROUTES.story.replace(':taskId', task.id)}>{t('task.review')}</Link>}
      {status === 'locked' && <span className="task-locked">{t('task.finishPrevious', { order: task.order - 1 })}</span>}
    </div>
  </li>
}

export default function TemplePage() {
  const { t } = useSettings()
  const { progress } = useGame()
  const nextTaskId = getNextTaskId(progress)
  const complete = isTempleComplete(progress)
  const completedCount = TASKS.filter(task => progress.missionCompletions[task.id]).length

  return <main className="temple-page">
    <Link className="detail-back" to={backToMap}><ArrowLeft size={19} />{t('common.backMap')}</Link>
    <article className="temple-detail temple-hero">
      <TempleArtwork />
      <div className="temple-hero-body">
        <p className="temple-location">{t('temple.location')}</p>
        <h1>{TEMPLE.name}</h1>
        <p className="demo-badge">{t('temple.routeProgress', { completed: completedCount, total: TASKS.length })}</p>
      </div>
    </article>

    {complete
      ? <section className="temple-complete" role="status">
        <h2>{t('temple.completeTitle')}</h2>
        <p>{t('temple.completeBody')}</p>
        <div className="temple-complete-links">
          <Link className="task-button" to={ROUTES.stamps}>{t('temple.viewStamps')}</Link>
          <Link className="task-button is-secondary" to={ROUTES.collection}>{t('temple.viewCollection')}</Link>
        </div>
      </section>
      : <p className="temple-next">{nextTaskId && t('temple.next', { task: t(`task.${nextTaskId}`) })}</p>}

    <section aria-label={t('temple.list')}>
      <ol className="task-list">
        {TASKS.map(task => <TaskCard key={task.id} task={task} status={getTaskStatus(progress, task.id)} completion={progress.missionCompletions[task.id]} t={t} />)}
      </ol>
    </section>
  </main>
}
