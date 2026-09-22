import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { STORIES, TASKS } from '../../data/temple.js'
import { useGame } from '../../state/GameContext.js'
import { useSettings } from '../../state/SettingsContext.js'
import { getPhoto } from '../../services/mediaStorage.js'
import { getTaskStatus } from '../../state/gameRules.js'
import { localizedValue } from '../../utils/templeLocalization.js'
import TempleArtwork from '../temple/TempleArtwork.jsx'

export default function StoryPage() {
  const { taskId } = useParams()
  const { progress, session } = useGame()
  const { language, t } = useSettings()
  const [photoUrl, setPhotoUrl] = useState('')
  const task = TASKS.find(item => item.id === taskId)
  const completion = progress.missionCompletions[taskId]
  const story = task ? STORIES[task.storyId] : null

  useEffect(() => {
    if (!task || completion?.evidence?.kind !== 'photo' || !session.profile?.userId) return undefined
    let cancelled = false
    getPhoto({ ownerId: session.profile.userId, mediaId: completion.evidence.mediaId })
      .then(result => {
        const blob = result instanceof Blob ? result : result?.blob
        if (!cancelled && blob) setPhotoUrl(URL.createObjectURL(blob))
      })
      .catch(() => {})
    return () => {
      cancelled = true
      setPhotoUrl(current => {
        if (current) URL.revokeObjectURL(current)
        return ''
      })
    }
  }, [completion, session.profile, task])

  if (!task) return <Navigate to={ROUTES.temple} replace />
  if (getTaskStatus(progress, task.id) !== 'completed') return <Navigate to={ROUTES.mission.replace(':taskId', task.id)} replace />

  const taskTitle = t(`task.${task.id}`)
  const image = story?.image || photoUrl
  const title = localizedValue(story?.title, language, t('story.title', { task: taskTitle }))
  const content = localizedValue(story?.content, language, t('story.fallback', { task: taskTitle }))
  const imageAlt = localizedValue(story?.imageAlt, language, t('story.imageAlt'))
  const source = localizedValue(story?.source, language, t('story.demoSource'))
  return <main className="story-page">
    <article className="story-card">
      <p className="story-kicker">{t('story.kicker')}</p>
      <h1>{title}</h1>
      {image ? <img className="story-image" src={image} alt={imageAlt} /> : <TempleArtwork />}
      {!image && <p className="story-image-note">{t('story.imagePending')}</p>}
      <p className="story-content">{content}</p>
      <p className="story-source">{t('story.source')}{story?.sourceUrl ? <a href={story.sourceUrl} target="_blank" rel="noreferrer">{source}</a> : source}</p>
    </article>
    <Link className="task-button story-map-link" to={ROUTES.temple}>{t('story.back')}</Link>
  </main>
}
