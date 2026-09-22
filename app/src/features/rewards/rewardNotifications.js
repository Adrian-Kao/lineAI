import { CULTURAL_MEMORIES } from '../../data/culturalMemories.js'

const TEMPLE_REWARDS = {
  wanchun: {
    templeName: '萬春宮',
    imageUrl: '/stamps/wanchun.svg',
  },
}

const DISTRICT_LABELS = {
  '66000010': '台中市中區',
}

function addedValues(previous = [], next = []) {
  const previousValues = new Set(previous)
  return next.filter(value => !previousValues.has(value))
}

function stampKey(record) {
  return record?.templeId ?? record?.taskId ?? ''
}

function stampRewards(previous, next) {
  const previousKeys = new Set((previous.stampRecords ?? []).map(stampKey))
  return (next.stampRecords ?? []).filter(record => !previousKeys.has(stampKey(record))).map(record => {
    const templeId = stampKey(record)
    const content = TEMPLE_REWARDS[templeId]
    const templeName = content?.templeName ?? '宮廟'
    return {
      id: `stamp:${templeId}:${record.acquiredAt ?? ''}`,
      kind: 'stamp',
      eyebrow: '宮廟探索完成',
      title: `蒐集到${templeName}印章`,
      description: `完成${templeName}全部探索任務，專屬紀念章已收入集章簿。`,
      imageUrl: content?.imageUrl ?? null,
      imageAlt: `${templeName}專屬印章`,
    }
  })
}

function districtRewards(previous, next) {
  return addedValues(previous.completedDistrictIds, next.completedDistrictIds).flatMap(districtId => {
    const memory = CULTURAL_MEMORIES[districtId]
    const districtName = DISTRICT_LABELS[districtId] ?? '鄉鎮市區'
    return [
      {
        id: `district-memory:${districtId}`,
        kind: 'memory',
        eyebrow: '行政區探索完成',
        title: `蒐集到${districtName}圖鑑`,
        description: '完成區內所有宮廟探索，文化記憶照片已收入圖鑑。',
        imageUrl: memory?.imageUrl ?? null,
        imageAlt: memory?.imageAlt ?? `${districtName}文化記憶`,
      },
      {
        id: `district-points:${districtId}`,
        kind: 'points',
        eyebrow: '行政區完成獎勵',
        title: '獲得 50 LINE POINTS',
        description: `完成${districtName}全部宮廟探索。`,
        amount: 50,
      },
    ]
  })
}

function countyRewards(previous, next) {
  return addedValues(previous.completedCountyIds, next.completedCountyIds).map(countyId => ({
    id: `county-points:${countyId}`,
    kind: 'points',
    eyebrow: '縣市探索完成',
    title: '獲得 200 LINE POINTS',
    description: `完成${countyId || '整個縣市'}所有鄉鎮市區探索。`,
    amount: 200,
  }))
}

function taiwanRewards(previous, next) {
  if (previous.taiwanCompleted || !next.taiwanCompleted) return []
  return [
    {
      id: 'taiwan-points',
      kind: 'points',
      eyebrow: '全台探索完成',
      title: '獲得 1000 LINE POINTS',
      description: '完成台灣全部鄉鎮市區的宮廟探索。',
      amount: 1000,
    },
    {
      id: 'taiwan-sticker',
      kind: 'sticker',
      eyebrow: '全台完成紀念獎勵',
      title: '獲得永久紀念貼圖',
      description: '這份限定紀念將永久保留在你的探索旅程中。',
      imageUrl: '/rewards/templor-permanent-sticker.jpg',
      imageAlt: 'Templore 全台探索完成永久紀念貼圖',
    },
  ]
}

export function buildRewardNotifications(previous = {}, next = {}) {
  return [
    ...stampRewards(previous, next),
    ...districtRewards(previous, next),
    ...countyRewards(previous, next),
    ...taiwanRewards(previous, next),
  ]
}
