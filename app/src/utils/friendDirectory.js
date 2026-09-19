export function normalizeFriendLookup(type, value) {
  const input = String(value ?? '').trim()
  if (type === 'phone') return input.replace(/[^0-9+]/g, '')
  return input.replace(/^@/, '').toLowerCase()
}

export function validateFriendLookup(type, value) {
  const normalized = normalizeFriendLookup(type, value)
  if (type === 'phone') {
    if (!/^\+?[0-9]{9,15}$/.test(normalized)) throw new Error('請輸入完整電話號碼')
  } else if (!/^[a-z0-9._-]{4,30}$/.test(normalized)) {
    throw new Error('請輸入有效的 LINE ID')
  }
  return normalized
}

export function findFriendByLookup(directory, type, value) {
  const normalized = validateFriendLookup(type, value)
  return directory.find(friend => normalizeFriendLookup(type, friend[type === 'phone' ? 'phone' : 'lineId']) === normalized) ?? null
}
