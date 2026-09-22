import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { TASKS } from '../../data/temple.js'
import { useGame } from '../../state/GameContext.js'
import { getNextTaskId, getTask, getTaskStatus } from '../../state/gameRules.js'
import TaskProgress from '../../components/TaskProgress.jsx'
import StampTask from '../stamp/StampTask.jsx'
import PhotoTask from '../photo/PhotoTask.jsx'
import MinigameTask from '../minigames/MinigameTask.jsx'
import { useSettings } from '../../state/SettingsContext.js'
import { demoMissionConfig } from './missionFlow.js'
import './missionExperience.css'

export default function MissionPage() {
  const { taskId } = useParams()
  const { progress, completeTask } = useGame()
  const { t } = useSettings()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  if (taskId === 'demo') {
    const nextTaskId = getNextTaskId(progress)
    return <Navigate to={nextTaskId ? ROUTES.mission.replace(':taskId', nextTaskId) : ROUTES.temple} replace />
  }
  const task = getTask(taskId)
  if (!task) return <Navigate to={ROUTES.temple} replace />
  const nextTask = TASKS.find(item => item.order === task.order + 1)
  const status = getTaskStatus(progress, taskId)
  if (status !== 'available') return <main className="mission-page"><TaskProgress progress={progress} taskId={taskId} /><section className="mission-panel"><p>{t(status === 'completed' ? 'mission.alreadyDone' : 'mission.previousFirst')}</p><div className="mission-state-actions">{status === 'completed' && nextTask && <Link className="task-button" to={ROUTES.mission.replace(':taskId', nextTask.id)}>{t('story.next')}</Link>}<Link className="task-button is-secondary" to={ROUTES.temple}>{t('mission.back')}</Link></div></section></main>

  async function handleComplete(result) {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await completeTask(result)
      navigate(nextTask ? ROUTES.mission.replace(':taskId', nextTask.id) : ROUTES.story.replace(':taskId', taskId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('mission.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }
  const TaskComponent = { stamp: StampTask, photo: PhotoTask, puzzle: MinigameTask }[taskId]
  return <main className="mission-page"><TaskProgress progress={progress} taskId={taskId} /><section className={`mission-panel${taskId === 'photo' ? ' is-photo-align' : ''}`}><TaskComponent onComplete={handleComplete} disabled={submitting} {...(taskId === 'puzzle' ? { puzzleImageUrl: demoMissionConfig.demoPhoto } : {})} />{submitting && <p className="mission-status" role="status">{t('mission.saving')}</p>}{error && <p className="mission-error" role="alert">{error}</p>}</section></main>
}
