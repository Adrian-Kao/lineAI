import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { STORIES, TASKS, TEMPLE } from '../../data/temple.js'
import { useGame } from '../../state/GameContext.js'
import { getPhoto } from '../../services/mediaStorage.js'
import { getTaskStatus } from '../../state/gameRules.js'
import TempleArtwork from '../temple/TempleArtwork.jsx'

const DEMO_COUNTY = '台中市'
const DEMO_DISTRICT_CODE = '66000010'
const BACK_TO_MAP = `${ROUTES.county.replace(':county', encodeURIComponent(DEMO_COUNTY))}?district=${DEMO_DISTRICT_CODE}`

function fallbackStory(task) {
  return `完成「${task.title}」後，你在萬春宮留下了一段探索記錄。沿著任務一步步前進，這趟文化小旅行也多了一個值得回看的片段。`
}

export default function StoryPage() {
  const { taskId } = useParams()
  const { progress, session } = useGame()
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

  const image = story?.image || photoUrl
  const source = story?.source || '萬春宮 DEMO 活動流程紀錄'
  return <main className="story-page">
    <Link className="detail-back" to={ROUTES.temple}><ArrowLeft size={19} />返回任務頁</Link>
    <article className="story-card">
      <p className="story-kicker">萬春宮 · 任務完成</p>
      <h1>{story?.title || `${task.title}的小故事`}</h1>
      {image ? <img className="story-image" src={image} alt={story?.imageAlt || `${TEMPLE.name}探索紀錄`} /> : <TempleArtwork />}
      {!image && <p className="story-image-note">圖片待補：需使用具來源／授權的素材。</p>}
      <p className="story-content">{story?.content || fallbackStory(task)}</p>
      <p className="story-source">來源：{story?.sourceUrl ? <a href={story.sourceUrl} target="_blank" rel="noreferrer">{source}</a> : source}</p>
    </article>
    <Link className="task-button story-map-link" to={BACK_TO_MAP}>回到地圖</Link>
  </main>
}
