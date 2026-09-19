const TEMPLES = ['萬春宮', '大甲鎮瀾宮', '北港朝天宮', '鹿港天后宮', '南鯤鯓代天府', '台北龍山寺', '新港奉天宮', '松山慈祐宮', '關渡宮', '竹山紫南宮', '白沙屯拱天宮', '東港東隆宮', '澎湖天后宮', '祀典武廟', '三鳳宮', '指南宮']
const COUNTIES = ['台中市', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '台南市', '高雄市', '屏東縣', '苗栗縣', '新竹縣', '桃園市', '台北市', '新北市', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣']
const ACTIVITIES = ['元宵文化巡禮', '媽祖遶境限定任務', '端午祈福集章', '七夕文化夜行', '中元普度紀錄', '秋季古蹟開放日', '燈會限定探索', '王船文化季', '迎城隍期間活動', '傳統工藝體驗日', '老街走讀挑戰', '春節祈福路線', '廟埕戲曲之夜', '文化資產保存週', '地方信仰故事展', '跨年敲鐘紀念']

function demoDate(index) {
  if (index === 49) return '2026-09-20T10:00:00+08:00'
  const date = new Date(Date.UTC(2025, 0, 5 + index * 12, 4))
  return date.toISOString()
}

export const DEMO_JOURNEY_EVENTS = Array.from({ length: 50 }, (_, index) => {
  if (index === 49) return {
    id: 'taiwan-complete', type: 'final', route: 'main', occurredAt: demoDate(index),
    title: '台灣全區完成', description: '走遍全台灣的文化足跡，在旅程終點匯聚成完整回憶。', imageUrl: null,
  }
  const type = ['temple', 'county', 'event'][index % 3]
  const sequence = Math.floor(index / 3)
  if (type === 'temple') {
    const temple = TEMPLES[sequence % TEMPLES.length]
    return { id: `temple-${index + 1}`, type, route: index % 2 ? 'bottom' : 'top', occurredAt: demoDate(index), title: `拜訪${temple}`, description: `完成${temple}的文化探索與任務紀錄。`, imageUrl: null }
  }
  if (type === 'county') {
    const county = COUNTIES[sequence % COUNTIES.length]
    return { id: `county-${index + 1}`, type, route: index % 2 ? 'bottom' : 'top', occurredAt: demoDate(index), title: `完成${county}蒐集`, description: `點亮${county}的行政區收藏進度。`, imageUrl: null }
  }
  const activity = ACTIVITIES[sequence % ACTIVITIES.length]
  return { id: `event-${index + 1}`, type, route: index % 2 ? 'bottom' : 'top', occurredAt: demoDate(index), title: activity, description: `參與「${activity}」，留下期間限定的旅程記憶。`, imageUrl: null }
})
