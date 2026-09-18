export function formatTaipeiTime(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '時間未提供'
  return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
