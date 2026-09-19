export function formatTaipeiTime(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '時間未提供'
  return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function formatTaipeiDate(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '日期未提供'
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${values.year}/${values.month}/${values.day}`
}
