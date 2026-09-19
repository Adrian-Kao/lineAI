import { Link } from 'react-router'
import { ArrowLeft, Check } from 'lucide-react'
import { ROUTES } from '../config/routes.js'
import { TASKS, TEMPLE } from '../data/temple.js'
import { getTaskStatus } from '../state/gameRules.js'

// 三項任務共用的頁首：返回宮廟、進度點、目前任務標題。狀態由 gameRules 計算。
export default function TaskProgress({ progress, taskId }) {
  const current = TASKS.find(task => task.id === taskId)
  return <header className="task-progress">
    <Link className="detail-back" to={ROUTES.temple}><ArrowLeft size={19} />返回{TEMPLE.name}</Link>
    <ol className="task-steps" aria-label="任務進度">
      {TASKS.map(task => {
        const status = getTaskStatus(progress, task.id)
        const active = task.id === taskId
        return <li key={task.id} className={`task-step is-${status}${active ? ' is-active' : ''}`} aria-current={active ? 'step' : undefined}>
          <span className="task-step-dot" aria-hidden="true">{status === 'completed' ? <Check size={14} strokeWidth={3} /> : task.order}</span>
          <span className="task-step-label">{task.title}</span>
        </li>
      })}
    </ol>
    {current && <p className="task-progress-title">任務 {current.order}／{TASKS.length}<strong>{current.title}</strong></p>}
  </header>
}
