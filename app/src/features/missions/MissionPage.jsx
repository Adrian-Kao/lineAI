import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { useGame } from '../../state/GameContext.js'
import { getTask, getTaskStatus } from '../../state/gameRules.js'
import TaskProgress from '../../components/TaskProgress.jsx'
import StampTask from '../stamp/StampTask.jsx'
import PhotoTask from '../photo/PhotoTask.jsx'
import PuzzleTask from '../puzzle/PuzzleTask.jsx'
import { useSettings } from '../../state/SettingsContext.js'

export default function MissionPage() {
  const { taskId } = useParams()
  const { progress, completeTask } = useGame()
  const { t } = useSettings()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const task = getTask(taskId)
  if (!task) return <Navigate to={ROUTES.temple} replace />
  const status = getTaskStatus(progress, taskId)
  if (status !== 'available') return <main className="mission-page"><TaskProgress progress={progress} taskId={taskId} /><section className="mission-panel"><p>{t(status === 'completed' ? 'mission.alreadyDone' : 'mission.previousFirst')}</p><Link className="task-button is-secondary" to={ROUTES.temple}>{t('mission.back')}</Link></section></main>

  async function handleComplete(result) {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await completeTask(result)
      navigate(ROUTES.story.replace(':taskId', taskId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('mission.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }
  const TaskComponent = { stamp: StampTask, photo: PhotoTask, puzzle: PuzzleTask }[taskId]
  return <main className="mission-page"><TaskProgress progress={progress} taskId={taskId} /><section className="mission-panel"><TaskComponent onComplete={handleComplete} disabled={submitting} />{submitting && <p className="mission-status" role="status">{t('mission.saving')}</p>}{error && <p className="mission-error" role="alert">{error}</p>}</section></main>
}
