export const JOURNAL_ENTRIES = [
  {
    id: 'wanchun', visitOrder: 1, templeName: '萬春宮', location: '台中・中區', subtitle: '媽祖信仰・城市記憶',
    templeNameEn: 'Wanchun Temple', locationEn: 'Central District, Taichung', subtitleEn: 'Mazu Faith · Urban Memory',
    photo: '/journal/wanchun-temple.jpeg', photoPosition: 'center 44%', photoSize: 'cover', visitedAt: '2026-09-19T10:30:00+08:00',
    summary: '萬春宮座落於台中舊城區，香火與街區生活彼此交織。走進廟埕，也像走進城市長久保存的日常記憶。',
    personalNote: '午後的光落在廟門上，紅色燈籠輕輕晃著。完成任務後，我特別想把這份安定感留下來。',
    summaryEn: 'Wanchun Temple stands in Taichung’s old city, where incense and neighborhood life remain closely intertwined.',
    personalNoteEn: 'Afternoon light fell across the gate as red lanterns moved gently. I wanted to keep that quiet sense of calm.',
    stamp: { title: '萬春宮', titleEn: 'Wanchun Temple', place: '台中・中區', placeEn: 'Central District, Taichung', image: '/stamps/wanchun.svg' },
  },
  {
    id: 'xia-hai', visitOrder: 2, templeName: '台北霞海城隍廟', location: '台北・大稻埕', subtitle: '老城信仰・街町緣分',
    templeNameEn: 'Taipei Xia-Hai City God Temple', locationEn: 'Dadaocheng, Taipei', subtitleEn: 'Old City Faith · Neighborhood Bonds',
    photo: '/journal/journal-north.png', photoPosition: 'left center', photoSize: '205% auto', visitedAt: '2026-09-20T09:20:00+08:00',
    summary: '在大稻埕街屋與商行之間，廟宇承接地方信仰與人們對平安、良緣的盼望，也見證街區往來不息的歲月。',
    personalNote: '沿著迪化街慢慢走來，空氣裡有茶香和香火氣。許下心願後，覺得今天的腳步也變得輕盈。',
    summaryEn: 'Among Dadaocheng’s shop houses, the temple carries local hopes for safety and lasting relationships.',
    personalNoteEn: 'Tea and incense scented the walk along Dihua Street. After making a wish, every step felt lighter.',
    stamp: { title: '霞海城隍廟', titleEn: 'Xia-Hai City God Temple', place: '台北・大稻埕', placeEn: 'Dadaocheng, Taipei' },
  },
  {
    id: 'longshan', visitOrder: 3, templeName: '龍山寺', location: '台北・萬華', subtitle: '古城香火・匠藝風華',
    templeNameEn: 'Longshan Temple', locationEn: 'Wanhua, Taipei', subtitleEn: 'Old City Incense · Traditional Craft',
    photo: '/journal/journal-north.png', photoPosition: 'right center', photoSize: '205% auto', visitedAt: '2026-09-21T14:10:00+08:00',
    summary: '龍山寺是萬華重要的信仰地標，層次豐富的屋脊、雕飾與廟埕，共同保存老城的文化紋理。',
    personalNote: '站在廟埕抬頭看屋脊，每一處細節都值得停下來。人聲與鐘聲交錯，卻有一種沉靜的秩序。',
    summaryEn: 'Longshan Temple is a major Wanhua landmark whose layered roofs and carvings preserve the old city’s cultural texture.',
    personalNoteEn: 'Every roof detail invited a longer look. Voices and bells overlapped, yet the courtyard still felt quietly ordered.',
    stamp: { title: '龍山寺', titleEn: 'Longshan Temple', place: '台北・萬華', placeEn: 'Wanhua, Taipei' },
  },
  {
    id: 'xingtian', visitOrder: 4, templeName: '行天宮', location: '台北・中山', subtitle: '忠義精神・心安步履',
    templeNameEn: 'Xingtian Temple', locationEn: 'Zhongshan, Taipei', subtitleEn: 'Loyalty · Peace of Mind',
    photo: '/journal/journal-south.png', photoPosition: 'left center', photoSize: '205% auto', visitedAt: '2026-09-23T11:00:00+08:00',
    summary: '行天宮以關聖帝君信仰為核心，來訪的人們在整齊開闊的空間裡祈求平安，也沉澱繁忙生活中的心緒。',
    personalNote: '走進廟裡時不自覺放慢了腳步。離開前提醒自己，把認真與善意帶回每天的生活。',
    summaryEn: 'Centered on faith in Lord Guan, Xingtian Temple offers an open space for prayer and reflection amid city life.',
    personalNoteEn: 'My pace slowed as soon as I entered. Before leaving, I reminded myself to carry sincerity and kindness home.',
    stamp: { title: '行天宮', titleEn: 'Xingtian Temple', place: '台北・中山', placeEn: 'Zhongshan, Taipei' },
  },
  {
    id: 'tainan-matsu', visitOrder: 5, templeName: '大天后宮', location: '台南・中西區', subtitle: '府城媽祖・海洋記憶',
    templeNameEn: 'Grand Mazu Temple', locationEn: 'West Central District, Tainan', subtitleEn: 'Mazu Faith · Maritime Memory',
    photo: '/journal/journal-south.png', photoPosition: 'right center', photoSize: '205% auto', visitedAt: '2026-09-25T15:40:00+08:00',
    summary: '大天后宮承載府城深厚的媽祖信仰，廟宇格局與歷史痕跡，讓人感受到港城記憶在今日依然延續。',
    personalNote: '台南午後很熱，走進廟中卻立刻安靜下來。紅牆、木作與香氣，成了這趟旅程最溫暖的一頁。',
    summaryEn: 'The Grand Mazu Temple carries Tainan’s deep Mazu tradition, with historic traces that keep the port city’s memory alive.',
    personalNoteEn: 'The hot Tainan afternoon turned quiet inside. Red walls, woodwork, and incense became the warmest page of this journey.',
    stamp: { title: '大天后宮', titleEn: 'Grand Mazu Temple', place: '台南・中西區', placeEn: 'West Central District, Tainan' },
  },
]

export function sortJournalEntries(entries) {
  return [...entries].sort((left, right) => {
    const orderDifference = (left.visitOrder ?? Number.MAX_SAFE_INTEGER) - (right.visitOrder ?? Number.MAX_SAFE_INTEGER)
    if (orderDifference) return orderDifference
    return new Date(left.visitedAt).getTime() - new Date(right.visitedAt).getTime()
  })
}

export function localizeJournalEntries(entries, language) {
  if (language !== 'en') return entries
  return entries.map(entry => ({
    ...entry,
    templeName: entry.templeNameEn ?? entry.templeName,
    location: entry.locationEn ?? entry.location,
    subtitle: entry.subtitleEn ?? entry.subtitle,
    summary: entry.summaryEn ?? entry.summary,
    personalNote: entry.personalNoteEn ?? entry.personalNote,
    stamp: { ...entry.stamp, title: entry.stamp.titleEn ?? entry.stamp.title, place: entry.stamp.placeEn ?? entry.stamp.place },
  }))
}
