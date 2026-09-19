import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { useGame } from '../../state/GameContext.js'
import { getTask, getTaskStatus } from '../../state/gameRules.js'
import TaskProgress from '../../components/TaskProgress.jsx'
import StampTask from '../stamp/StampTask.jsx'
import PhotoTask from '../photo/PhotoTask.jsx'
import PuzzleTask from '../puzzle/PuzzleTask.jsx'

export default function MissionPage() {
  const { taskId } = useParams()
  const { progress, completeTask } = useGame()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const task = getTask(taskId)
  if (!task) return <Navigate to={ROUTES.temple} replace />
  const status = getTaskStatus(progress, taskId)
  if (status !== 'available') return <main className="mission-page"><TaskProgress progress={progress} taskId={taskId} /><section className="mission-panel"><p>{status === 'completed' ? '任務已完成' : '請先完成前一項任務'}</p><Link className="task-button is-secondary" to={ROUTES.temple}>返回萬春宮</Link></section></main>

  async function handleComplete(result) {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await completeTask(result)
      navigate(ROUTES.story.replace(':taskId', taskId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '保存失敗，請重試')
    } finally {
      setSubmitting(false)
    }
  }
  const TaskComponent = { stamp: StampTask, photo: PhotoTask, puzzle: PuzzleTask }[taskId]
  return <main className="mission-page"><TaskProgress progress={progress} taskId={taskId} /><section className="mission-panel"><TaskComponent onComplete={handleComplete} disabled={submitting} />{submitting && <p className="mission-status" role="status">正在保存…</p>}{error && <p className="mission-error" role="alert">{error}</p>}</section></main>
}
