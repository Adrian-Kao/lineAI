export const SOURCE_COUNTY_NAMES = [
  '連江縣', '金門縣', '宜蘭縣', '彰化縣', '南投縣', '雲林縣',
  '屏東縣', '臺東縣', '花蓮縣', '澎湖縣', '基隆市', '新竹市',
  '臺北市', '新北市', '臺中市', '臺南市', '桃園市', '苗栗縣',
  '新竹縣', '嘉義市', '嘉義縣', '高雄市',
]

const byDisplayName = new Map(SOURCE_COUNTY_NAMES.map(name => [name.replace(/臺/g, '台'), name]))

export function toDisplayCountyName(value) {
  return typeof value === 'string' ? value.normalize('NFKC').trim().replace(/臺/g, '台') : ''
}

export function toSourceCountyName(value) {
  return byDisplayName.get(toDisplayCountyName(value)) ?? null
}
