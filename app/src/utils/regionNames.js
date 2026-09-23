const COUNTY_NAMES_EN = {
  台北市: 'Taipei City', 新北市: 'New Taipei City', 基隆市: 'Keelung City',
  桃園市: 'Taoyuan City', 新竹縣: 'Hsinchu County', 新竹市: 'Hsinchu City', 苗栗縣: 'Miaoli County',
  台中市: 'Taichung City', 彰化縣: 'Changhua County', 南投縣: 'Nantou County',
  雲林縣: 'Yunlin County', 嘉義縣: 'Chiayi County', 嘉義市: 'Chiayi City', 台南市: 'Tainan City',
  高雄市: 'Kaohsiung City', 屏東縣: 'Pingtung County', 宜蘭縣: 'Yilan County', 花蓮縣: 'Hualien County',
  台東縣: 'Taitung County', 澎湖縣: 'Penghu County', 金門縣: 'Kinmen County', 連江縣: 'Lienchiang County',
}

function normalizeTai(value = '') {
  return value.replaceAll('臺', '台')
}

export function localizeCountyName(name, language) {
  if (language !== 'en') return name
  return COUNTY_NAMES_EN[normalizeTai(name)] ?? name
}

export function localizeDistrictName(district, language) {
  if (language !== 'en') return typeof district === 'string' ? district : district?.name ?? ''
  if (typeof district === 'string') return district
  return district?.englishName || district?.name || ''
}

export function localizeRegionLabel(county, district, language) {
  if (language !== 'en') return `${normalizeTai(county).replace(/[縣市]$/, '')}・${typeof district === 'string' ? district : district?.name ?? ''}`
  return `${localizeDistrictName(district, language)}, ${localizeCountyName(county, language)}`
}
