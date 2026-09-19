// D：依 docs/project-guide.md 實作；此元件目前僅為骨架。
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGame } from '../../state/GameContext.js'
import { getPhoto } from '../../services/mediaStorage.js'
import { STORIES, TASKS, TEMPLE } from '../../data/temple.js'

function formatTime(value) {
  if (!value) return '時間未記錄'

  return new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Taipei',
  }).format(new Date(value))
}

export function buildTimeline(progress) {
  const completions = progress?.missionCompletions ?? []
  const photoRecords = progress?.photoRecords ?? []
  const stampRecords = progress?.stampRecords ?? []

  return completions
    .map((completion) => {
      const task = TASKS.find((item) => item.id === completion.taskId)
      if (!task) return null

      const photo = photoRecords.find((item) => item.taskId === task.id)
      const stamp = stampRecords.find((item) => item.taskId === task.id)
      const story = STORIES[task.storyId]

      return {
        id: `${task.id}-${completion.completedAt}`,
        taskId: task.id,
        title: task.title,
        completedAt: completion.completedAt,
        story: story?.content ?? `完成「${task.title}」，留下這段萬春宮旅程記憶。`,
        stampName: stamp?.name ?? (task.id === 'stamp' ? '萬春宮數位紀念章' : null),
        mediaId: completion.evidence?.mediaId ?? photo?.mediaId ?? null,
        photoUrl: photo?.photoUrl ?? photo?.previewUrl ?? null,
      }
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    )
}

export default function JournalPage() {
  const { progress, session } = useGame()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAt, setGeneratedAt] = useState(null)
  const [photoUrls, setPhotoUrls] = useState({})
  const [shareMessage, setShareMessage] = useState('')
  const objectUrlsRef = useRef([])

  const profile = session.profile
  const timeline = useMemo(() => buildTimeline(progress), [progress])
  const journalReady = Boolean(generatedAt)

  useEffect(() => {
    if (!journalReady || !profile?.userId) return undefined

    let cancelled = false

    async function loadPhotos() {
      const entries = await Promise.all(
        timeline.map(async (item) => {
          if (item.photoUrl) return [item.id, item.photoUrl]
          if (!item.mediaId) return [item.id, null]

          try {
            const result = await getPhoto({
              ownerId: profile.userId,
              mediaId: item.mediaId,
            })
            const blob = result instanceof Blob ? result : result?.blob

            if (!blob) return [item.id, null]

            const url = URL.createObjectURL(blob)
            objectUrlsRef.current.push(url)
            return [item.id, url]
          } catch {
            return [item.id, null]
          }
        }),
      )

      if (!cancelled) {
        setPhotoUrls(Object.fromEntries(entries.filter(([, url]) => url)))
      }
    }

    loadPhotos()

    return () => {
      cancelled = true
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    }
  }, [journalReady, profile?.userId, timeline])

  function handleCreateJournal() {
    setShareMessage('')
    setIsGenerating(true)

    window.setTimeout(() => {
      setGeneratedAt(new Date().toISOString())
      setIsGenerating(false)
    }, 900)
  }

  async function handleShare() {
    const text = `${profile?.name ?? '旅人'}的${TEMPLE.name}旅程手札：完成 ${timeline.length} 項任務。`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${TEMPLE.name}旅程手札`,
          text,
        })
        setShareMessage('已開啟分享選單。')
        return
      }

      await navigator.clipboard.writeText(text)
      setShareMessage('手札文字已複製，可以貼到 LINE 分享。')
    } catch {
      setShareMessage('分享已取消。')
    }
  }

  return (
    <section className="journal-page">
      <header>
        <p>個人旅程紀錄</p>
        <h2>{TEMPLE.name}手札</h2>
        <p>
          將你的集章、照片與任務故事整理成一頁專屬回憶。
        </p>
      </header>

      {!journalReady && (
        <button
          type="button"
          onClick={handleCreateJournal}
          disabled={isGenerating || session.status !== 'ready'}
        >
          {isGenerating ? '手札生成中…' : '製作我的手札'}
        </button>
      )}

      {isGenerating && (
        <p role="status" aria-live="polite">
          正在整理你的照片、章與故事…
        </p>
      )}

      {journalReady && (
        <article className="journal-card">
          <header>
            <p>{profile?.name ?? '旅人'}的旅程手札</p>
            <h3>{TEMPLE.name}</h3>
            <time dateTime={generatedAt}>製作時間：{formatTime(generatedAt)}</time>
          </header>

          {timeline.length === 0 ? (
            <p>尚未完成任務；完成任一任務後再來製作手札吧。</p>
          ) : (
            <ol className="journal-timeline">
              {timeline.map((item) => (
                <li key={item.id}>
                  <time dateTime={item.completedAt}>
                    {formatTime(item.completedAt)}
                  </time>
                  <h4>{item.title}</h4>

                  {item.stampName && (
                    <p aria-label="取得的章">印章：{item.stampName}</p>
                  )}

                  {photoUrls[item.id] && (
                    <img
                      src={photoUrls[item.id]}
                      alt={`${item.title}的任務照片`}
                    />
                  )}

                  <p>{item.story}</p>
                </li>
              ))}
            </ol>
          )}

          <button type="button" onClick={handleShare}>
            分享手札
          </button>

          {shareMessage && <p role="status">{shareMessage}</p>}
        </article>
      )}
    </section>
  )
}
