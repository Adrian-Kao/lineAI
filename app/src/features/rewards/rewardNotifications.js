import { CULTURAL_MEMORIES } from '../../data/culturalMemories.js'
import { localizeCountyName } from '../../utils/regionNames.js'

const TEMPLE_REWARDS = {
  wanchun: {
    templeName: '萬春宮',
    imageUrl: '/stamps/wanchun.svg',
  },
}

const DISTRICT_LABELS = {
  '66000010': '台中市中區',
}

const REWARD_COPY = {
  'zh-TW': {
    templeName: '萬春宮', genericTemple: '宮廟', templeEyebrow: '宮廟探索完成', stampTitle: name => `蒐集到${name}印章`, stampDescription: name => `完成${name}全部探索任務，專屬紀念章已收入集章簿。`, stampAlt: name => `${name}專屬印章`,
    districtName: '鄉鎮市區', centralDistrict: '台中市中區', districtEyebrow: '行政區探索完成', memoryTitle: name => `蒐集到${name}圖鑑`, memoryDescription: '完成區內所有宮廟探索，文化記憶照片已收入圖鑑。', memoryAlt: name => `${name}文化記憶`, districtPointsEyebrow: '行政區完成獎勵', districtPointsDescription: name => `完成${name}全部宮廟探索。`,
    countyEyebrow: '縣市探索完成', countyFallback: '整個縣市', countyDescription: name => `完成${name}所有鄉鎮市區探索。`, taiwanEyebrow: '全台探索完成', taiwanDescription: '完成台灣全部鄉鎮市區的宮廟探索。', stickerEyebrow: '全台完成紀念獎勵', stickerTitle: '獲得永久紀念貼圖', stickerDescription: '這份限定紀念將永久保留在你的探索旅程中。', stickerAlt: 'Templore 全台探索完成永久紀念貼圖', pointsTitle: amount => `獲得 ${amount} LINE POINTS`,
  },
  en: {
    templeName: 'Wanchun Temple', genericTemple: 'Temple', templeEyebrow: 'Temple Exploration Complete', stampTitle: name => `${name} Stamp Collected`, stampDescription: name => `All ${name} exploration missions are complete. Its commemorative stamp is now in your Stamp Book.`, stampAlt: name => `${name} commemorative stamp`,
    districtName: 'District', centralDistrict: 'Central District, Taichung City', districtEyebrow: 'District Exploration Complete', memoryTitle: name => `${name} Gallery Item Collected`, memoryDescription: 'All temples in this district are complete. Its cultural memory photo is now in your gallery.', memoryAlt: name => `${name} cultural memory`, districtPointsEyebrow: 'District Completion Reward', districtPointsDescription: name => `Completed every temple exploration in ${name}.`,
    countyEyebrow: 'City or County Complete', countyFallback: 'the entire city or county', countyDescription: name => `Completed every district exploration in ${name}.`, taiwanEyebrow: 'Taiwan Exploration Complete', taiwanDescription: 'Completed temple exploration across every district in Taiwan.', stickerEyebrow: 'Taiwan Completion Reward', stickerTitle: 'Permanent Sticker Collected', stickerDescription: 'This limited commemorative sticker will remain permanently in your journey collection.', stickerAlt: 'Templore permanent sticker for completing Taiwan exploration', pointsTitle: amount => `${amount} LINE POINTS Awarded`,
  },
}

function addedValues(previous = [], next = []) {
  const previousValues = new Set(previous)
  return next.filter(value => !previousValues.has(value))
}

function stampKey(record) {
  return record?.templeId ?? record?.taskId ?? ''
}

function stampRewards(previous, next, copy) {
  const previousKeys = new Set((previous.stampRecords ?? []).map(stampKey))
  return (next.stampRecords ?? []).filter(record => !previousKeys.has(stampKey(record))).map(record => {
    const templeId = stampKey(record)
    const content = TEMPLE_REWARDS[templeId]
    const templeName = content ? copy.templeName : copy.genericTemple
    return {
      id: `stamp:${templeId}:${record.acquiredAt ?? ''}`,
      kind: 'stamp',
      eyebrow: copy.templeEyebrow,
      title: copy.stampTitle(templeName),
      description: copy.stampDescription(templeName),
      imageUrl: content?.imageUrl ?? null,
      imageAlt: copy.stampAlt(templeName),
    }
  })
}

function districtRewards(previous, next, copy, language) {
  return addedValues(previous.completedDistrictIds, next.completedDistrictIds).flatMap(districtId => {
    const memory = CULTURAL_MEMORIES[districtId]
    const districtName = districtId === '66000010' && language === 'en' ? copy.centralDistrict : DISTRICT_LABELS[districtId] ?? copy.districtName
    return [
      {
        id: `district-memory:${districtId}`,
        kind: 'memory',
        eyebrow: copy.districtEyebrow,
        title: copy.memoryTitle(districtName),
        description: copy.memoryDescription,
        imageUrl: memory?.imageUrl ?? null,
        imageAlt: language === 'en' ? copy.memoryAlt(districtName) : memory?.imageAlt ?? copy.memoryAlt(districtName),
      },
      {
        id: `district-points:${districtId}`,
        kind: 'points',
        eyebrow: copy.districtPointsEyebrow,
        title: copy.pointsTitle(50),
        description: copy.districtPointsDescription(districtName),
        amount: 50,
      },
    ]
  })
}

function countyRewards(previous, next, copy, language) {
  return addedValues(previous.completedCountyIds, next.completedCountyIds).map(countyId => ({
    id: `county-points:${countyId}`,
    kind: 'points',
    eyebrow: copy.countyEyebrow,
    title: copy.pointsTitle(200),
    description: copy.countyDescription(countyId ? localizeCountyName(countyId, language) : copy.countyFallback),
    amount: 200,
  }))
}

function taiwanRewards(previous, next, copy) {
  if (previous.taiwanCompleted || !next.taiwanCompleted) return []
  return [
    {
      id: 'taiwan-points',
      kind: 'points',
      eyebrow: copy.taiwanEyebrow,
      title: copy.pointsTitle(1000),
      description: copy.taiwanDescription,
      amount: 1000,
    },
    {
      id: 'taiwan-sticker',
      kind: 'sticker',
      eyebrow: copy.stickerEyebrow,
      title: copy.stickerTitle,
      description: copy.stickerDescription,
      imageUrl: '/rewards/templor-permanent-sticker.jpg',
      imageAlt: copy.stickerAlt,
    },
  ]
}

export function buildRewardNotifications(previous = {}, next = {}, language = 'zh-TW') {
  const copy = REWARD_COPY[language] ?? REWARD_COPY['zh-TW']
  return [
    ...stampRewards(previous, next, copy),
    ...districtRewards(previous, next, copy, language),
    ...countyRewards(previous, next, copy, language),
    ...taiwanRewards(previous, next, copy),
  ]
}

export function buildDemoRewardNotifications(language = 'zh-TW') {
  const previous = {
    stampRecords: [], completedDistrictIds: [], completedCountyIds: [], taiwanCompleted: false,
  }
  const next = {
    stampRecords: [{ templeId: 'wanchun', acquiredAt: 'demo' }],
    completedDistrictIds: ['66000010'],
    completedCountyIds: ['台中市'],
    taiwanCompleted: true,
  }
  return buildRewardNotifications(previous, next, language)
}
