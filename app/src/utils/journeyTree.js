export const JOURNEY_LAYOUT = { startX: 110, gapX: 184, mainY: 310, topY: 174, bottomY: 446, height: 650 }

export function getJourneyRoadY(index) {
  const wave = Math.sin(index * 1.19) * 23 + Math.sin(index * .43) * 13
  return Math.round(JOURNEY_LAYOUT.mainY + wave)
}

export function buildJourneyRoadPath(events, stageWidth) {
  if (!events.length) return ''
  const points = [
    { x: 40, y: events[0].mainY },
    ...events.map(event => ({ x: event.x, y: event.mainY })),
    { x: stageWidth - 70, y: events.at(-1).mainY },
  ]
  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)]
    const current = points[index]
    const next = points[index + 1]
    const after = points[Math.min(points.length - 1, index + 2)]
    const firstControlX = current.x + (next.x - previous.x) / 6
    const firstControlY = current.y + (next.y - previous.y) / 6
    const secondControlX = next.x - (after.x - current.x) / 6
    const secondControlY = next.y - (after.y - current.y) / 6
    path += ` C ${firstControlX} ${firstControlY}, ${secondControlX} ${secondControlY}, ${next.x} ${next.y}`
  }
  return path
}

export function buildJourneyTree(events) {
  const ordered = [...events].filter(event => event?.id && event?.occurredAt)
    .sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime())
  return ordered.map((event, index) => ({
    ...event,
    index,
    x: JOURNEY_LAYOUT.startX + index * JOURNEY_LAYOUT.gapX,
    mainY: getJourneyRoadY(index),
    route: index === ordered.length - 1 ? 'main' : event.route === 'bottom' ? 'bottom' : 'top',
  }))
}

export function getJourneyStageWidth(eventCount) {
  return Math.max(720, JOURNEY_LAYOUT.startX * 2 + Math.max(0, eventCount - 1) * JOURNEY_LAYOUT.gapX)
}
