import { STORIES, TASKS } from '../data/temple.js'

export function buildTimeline(progress) {
  const stored = progress?.missionCompletions ?? {}
  const completions = Array.isArray(stored)
    ? stored
    : Object.entries(stored).map(([taskId, completion]) => ({ taskId, ...completion }))
  const photoRecords = progress?.photoRecords ?? []
  const stampRecords = progress?.stampRecords ?? []

  return completions.map((completion) => {
    const task = TASKS.find(item => item.id === completion.taskId)
    if (!task) return null
    const photo = photoRecords.find(item => item.taskId === task.id)
    const stamp = stampRecords.find(item => item.taskId === task.id)
    return {
      id: `${task.id}-${completion.completedAt}`,
      taskId: task.id,
      title: task.title,
      completedAt: completion.completedAt,
      story: STORIES[task.storyId]?.content ?? `完成「${task.title}」，留下這段萬春宮旅程記憶。`,
      stampName: stamp?.name ?? (task.id === 'stamp' ? '萬春宮數位紀念章' : null),
      mediaId: completion.evidence?.mediaId ?? photo?.mediaId ?? null,
      photoUrl: photo?.photoUrl ?? photo?.previewUrl ?? null,
    }
  }).filter(Boolean).sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
}
