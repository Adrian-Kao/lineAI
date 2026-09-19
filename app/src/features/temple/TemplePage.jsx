import { Link } from 'react-router'
import { ArrowLeft, Camera, Check, Lock, Puzzle, Stamp } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { TASKS, TEMPLE } from '../../data/temple.js'
import { useGame } from '../../state/GameContext.js'
import { getNextTaskId, getTaskStatus, isTempleComplete } from '../../state/gameRules.js'
import { formatTaipeiTime } from '../../utils/formatTime.js'
import TempleArtwork from './TempleArtwork.jsx'

// 萬春宮位於台中市中區；與 MapPage 使用的區碼一致，讓返回地圖時回到同一個區。
const DEMO_COUNTY = '台中市'
const DEMO_DISTRICT_CODE = '66000010'
const backToMap = `${ROUTES.county.replace(':county', encodeURIComponent(DEMO_COUNTY))}?district=${DEMO_DISTRICT_CODE}`

const TASK_ICONS = { stamp: Stamp, photo: Camera, puzzle: Puzzle }
// 只描述操作方式，不放文化內容；故事由 STORIES 提供。
const TASK_HINTS = {
  stamp: '依畫面說明完成模擬感應，印章會加入集章簿。',
  photo: '到指定位置拍攝或選圖，對位後補上缺口並保存。',
  puzzle: '完成拼圖後即可閱讀文化故事。',
}
const STATUS_LABELS = { locked: '鎖定', available: '可開始', completed: '已完成' }

function TaskCard({ task, status, completion }) {
  const Icon = TASK_ICONS[task.type]
  return <li className={`task-card is-${status}`}>
    <div className="task-icon" aria-hidden="true">{status === 'completed' ? <Check size={22} /> : status === 'locked' ? <Lock size={20} /> : <Icon size={22} />}</div>
    <div className="task-body">
      <p className="task-order">任務 {task.order}<span className="task-status">{STATUS_LABELS[status]}</span></p>
      <h3>{task.title}</h3>
      <p className="task-hint">{status === 'completed' && completion ? `完成時間：${formatTaipeiTime(completion.completedAt)}` : TASK_HINTS[task.id]}</p>
    </div>
    <div className="task-action">
      {status === 'available' && <Link className="task-button" to={ROUTES.mission.replace(':taskId', task.id)}>開始</Link>}
      {status === 'completed' && <Link className="task-button is-secondary" to={ROUTES.story.replace(':taskId', task.id)}>回顧</Link>}
      {status === 'locked' && <span className="task-locked">請先完成任務 {task.order - 1}</span>}
    </div>
  </li>
}

export default function TemplePage() {
  const { progress } = useGame()
  const nextTaskId = getNextTaskId(progress)
  const complete = isTempleComplete(progress)
  const completedCount = TASKS.filter(task => progress.missionCompletions[task.id]).length

  return <main className="temple-page">
    <Link className="detail-back" to={backToMap}><ArrowLeft size={19} />返回地圖</Link>
    <article className="temple-detail temple-hero">
      <TempleArtwork />
      <div className="temple-hero-body">
        <p className="temple-location">{DEMO_COUNTY}中區</p>
        <h1>{TEMPLE.name}</h1>
        <p className="demo-badge">DEMO 活動路線：{completedCount} / {TASKS.length} 項任務完成</p>
      </div>
    </article>

    {complete
      ? <section className="temple-complete" role="status">
        <h2>中區 DEMO 活動路線完成</h2>
        <p>三項任務都已完成，萬春宮錨點已在地圖上點亮。</p>
        <div className="temple-complete-links">
          <Link className="task-button" to={ROUTES.stampbook}>查看集章簿</Link>
          <Link className="task-button is-secondary" to={ROUTES.collection}>查看圖鑑</Link>
        </div>
      </section>
      : <p className="temple-next">請依序完成三項任務{nextTaskId && `，下一步：${TASKS.find(task => task.id === nextTaskId).title}`}</p>}

    <section aria-label="任務清單">
      <ol className="task-list">
        {TASKS.map(task => <TaskCard key={task.id} task={task} status={getTaskStatus(progress, task.id)} completion={progress.missionCompletions[task.id]} />)}
      </ol>
    </section>
  </main>
}
