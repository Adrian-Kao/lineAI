const PROFILE_KEY_PREFIX = 'wanchun-profile:v1:'

export function makeProfileKey(userId) {
  if (!userId) throw new Error('缺少 LINE 使用者 ID')
  return `${PROFILE_KEY_PREFIX}${userId}`
}

export function validateProfileInput({ name, phone, avatar }) {
  const normalizedName = String(name ?? '').trim()
  const normalizedPhone = String(phone ?? '').trim()
  if (!normalizedName) throw new Error('姓名不可空白')
  if (normalizedName.length > 40) throw new Error('姓名不可超過 40 個字')
  if (normalizedPhone.length > 24) throw new Error('電話不可超過 24 個字元')
  if (normalizedPhone && !/^[0-9+()\-\s#]+$/.test(normalizedPhone)) throw new Error('電話格式不正確')
  if (avatar && !String(avatar).startsWith('data:image/') && !String(avatar).startsWith('http')) throw new Error('頭像格式不正確')
  return { name: normalizedName, phone: normalizedPhone, avatar: avatar || null }
}

export function applyProfilePreferences(lineProfile, preferences = {}) {
  return {
    ...lineProfile,
    lineName: lineProfile.lineName ?? lineProfile.name,
    lineAvatar: lineProfile.lineAvatar ?? lineProfile.avatar ?? null,
    name: preferences.name || lineProfile.name,
    phone: preferences.phone || '',
    avatar: preferences.avatar || lineProfile.avatar || null,
  }
}

export function loadProfilePreferences(userId) {
  try {
    const raw = localStorage.getItem(makeProfileKey(userId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveProfilePreferences(userId, input) {
  const preferences = validateProfileInput(input)
  localStorage.setItem(makeProfileKey(userId), JSON.stringify(preferences))
  return preferences
}

export function clearProfilePreferences(userId, storage = globalThis.localStorage) {
  storage?.removeItem(makeProfileKey(userId))
}
