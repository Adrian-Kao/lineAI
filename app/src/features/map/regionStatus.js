export const REGION_STATUS_COLORS = {
  locked: { fill: [216, 217, 207, 238], line: [158, 166, 151, 235] },
  inProgress: { fill: [217, 237, 178, 245], line: [121, 165, 99, 240] },
  unlocked: { fill: [126, 202, 128, 245], line: [70, 142, 80, 240] },
}

export function getRegionStatus(regionProgress, countyName) {
  const status = regionProgress[countyName]
  return Object.hasOwn(REGION_STATUS_COLORS, status) ? status : 'locked'
}
