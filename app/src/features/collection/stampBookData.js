import { ROUTES } from '../../config/routes.js'
import { loadCountyTemples } from '../../services/templeData.js'
import { formatTempleName } from '../../utils/formatTempleName.js'

const LIVE_STAMPS = [
  {
    templeId: 'wanchun', sourceId: '51c2c438-6bf2-4d6b-b10f-749ae1e95948', templeName: '萬春宮',
    county: '台中市', district: '中區', locationLabel: '台中・中區', stampImage: '/stamps/wanchun.svg',
    journalEntryId: 'wanchun', legacyTaskId: 'stamp',
  },
]

const DEMO_STAMPS = [
  {
    templeId: 'lecheng', sourceId: 'ee091aaf-8528-4039-92bf-1b3b0a20ec81', templeName: '樂成宮',
    county: '台中市', district: '東區', locationLabel: '台中・東區', stampImage: '/stamps/lecheng.svg',
  },
  {
    templeId: 'xingtian', sourceId: '7bc3508f-a3ec-4618-8f4f-506a78d8b0b6', templeName: '行天宮',
    county: '台北市', district: '中山區', locationLabel: '台北・中山區', stampImage: '/stamps/xingtian.svg',
  },
  {
    templeId: 'xia-hai', sourceId: 'cbd1cbc2-45ef-4ca7-aa67-7148054dd016', templeName: '霞海城隍廟',
    county: '台北市', district: '大同區', locationLabel: '台北・大同區', stampImage: '/stamps/xia-hai.svg',
  },
  {
    templeId: 'longshan', sourceId: 'd1f19b26-a9e8-4ed7-bd24-ac045437a758', templeName: '龍山寺',
    county: '台北市', district: '萬華區', locationLabel: '台北・萬華區', stampImage: '/stamps/longshan.svg',
  },
  {
    templeId: 'tainan-matsu', sourceId: '1054d1a4-a57a-4876-ad87-a2f4e233e941', templeName: '大天后宮',
    county: '台南市', district: '中西區', locationLabel: '台南・中西區', stampImage: '/stamps/tainan-matsu.svg',
  },
]

function templeDetailRoute(entry) {
  return ROUTES.templeDetail
    .replace(':county', encodeURIComponent(entry.county))
    .replace(':uuid', entry.sourceId)
}

export function getPlayableStampCatalog(includeDemo = false) {
  return includeDemo ? [...LIVE_STAMPS, ...DEMO_STAMPS].map(entry => ({ ...entry, demo: !entry.legacyTaskId })) : LIVE_STAMPS
}

const DEMO_DISTRICTS = ['中區', '北區', '西區']

export const formatStampTempleName = formatTempleName

export async function loadTaichungDemoStampCatalog(signal) {
  const temples = await loadCountyTemples('台中市', signal)
  return temples
    .map(temple => ({
      temple,
      district: DEMO_DISTRICTS.find(district => (temple.address ?? '').includes(`臺中市${district}`) || (temple.address ?? '').includes(`台中市${district}`)),
    }))
    .filter(({ district }) => district)
    .map(({ temple, district }) => temple.id === LIVE_STAMPS[0].sourceId
      ? { ...LIVE_STAMPS[0] }
      : {
          templeId: temple.id,
          sourceId: temple.id,
          templeName: formatStampTempleName(temple.name),
          county: '台中市',
          district,
          locationLabel: `台中・${district}`,
          stampImage: null,
        })
    .sort((left, right) => {
      if (left.templeId === 'wanchun') return -1
      if (right.templeId === 'wanchun') return 1
      const districtDifference = DEMO_DISTRICTS.indexOf(left.district) - DEMO_DISTRICTS.indexOf(right.district)
      if (districtDifference) return districtDifference
      return left.templeName.localeCompare(right.templeName, 'zh-TW')
    })
}

export function buildStampEntries(catalog, stampRecords = []) {
  return catalog.map(temple => {
    const record = stampRecords.find(item => item.templeId === temple.templeId || (temple.legacyTaskId && item.taskId === temple.legacyTaskId))
    return {
      ...temple,
      templeName: formatStampTempleName(temple.templeName),
      templeRoute: templeDetailRoute(temple),
      journalRoute: temple.journalEntryId ? `${ROUTES.journal}?entry=${encodeURIComponent(temple.journalEntryId)}` : null,
      collected: Boolean(record),
      collectedAt: record?.acquiredAt ?? record?.completedAt ?? null,
    }
  })
}

export function formatStampDate(value) {
  if (!value || Number.isNaN(Date.parse(value))) return ''
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(value)).replaceAll('/', '.')
}
