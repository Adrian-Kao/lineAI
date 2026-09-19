import { Link } from 'react-router'
import { ArrowLeft, Check } from 'lucide-react'
import { ROUTES } from '../config/routes.js'
import { TASKS } from '../data/temple.js'
import { getTaskStatus } from '../state/gameRules.js'
import { useSettings } from '../state/SettingsContext.js'

// 三項任務共用的頁首：返回宮廟、進度點、目前任務標題。狀態由 gameRules 計算。
export default function TaskProgress({ progress, taskId }) {
  const { t } = useSettings()
  const current = TASKS.find(task => task.id === taskId)
  return <header className="task-progress">
    <Link className="detail-back" to={ROUTES.temple}><ArrowLeft size={19} />{t('temple.back')}</Link>
    <ol className="task-steps" aria-label={t('task.progress')}>
      {TASKS.map(task => {
        const status = getTaskStatus(progress, task.id)
        const active = task.id === taskId
        return <li key={task.id} className={`task-step is-${status}${active ? ' is-active' : ''}`} aria-current={active ? 'step' : undefined}>
          <span className="task-step-dot" aria-hidden="true">{status === 'completed' ? <Check size={14} strokeWidth={3} /> : task.order}</span>
          <span className="task-step-label">{t(`task.${task.id}`)}</span>
        </li>
      })}
    </ol>
    {current && <p className="task-progress-title">{t('task.label', { order: `${current.order}/${TASKS.length}` })}<strong>{t(`task.${current.id}`)}</strong></p>}
  </header>
}
