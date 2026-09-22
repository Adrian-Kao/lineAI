export function formatTempleName(name) {
  if (typeof name !== 'string') return ''
  return name
    .trim()
    .replace(/^財團法人\s*/, '')
    .replace(/^(?:(?:臺灣省|台灣省)\s*)?(?:臺中市|台中市|臺中|台中)\s*/, '')
    .trim()
}
