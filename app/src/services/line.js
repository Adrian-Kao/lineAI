import liff from '@line/liff'
import { readEnv } from '../config/env.js'

// 本機開發用：VITE_AUTH_MODE=mock 且為 dev build 時，跳過 LIFF 改用固定假 profile。
// 正式 build 不會啟用；進度會以 mock 的 userId 存在 localStorage，與真實 LINE 帳號不互通。
const MOCK_PROFILE = { userId: 'mock-dev-user', name: '測試玩家（模擬）', avatar: null }
function isMockMode() { return import.meta.env.DEV && readEnv().authMode === 'mock' }

let initPromise
export async function initLine() {
  if (isMockMode()) return null
  const { liffId } = readEnv()
  if (!liffId) throw new Error('尚未設定 VITE_LIFF_ID')
  initPromise ??= liff.init({ liffId }).catch(error => { initPromise = undefined; throw error })
  await initPromise
  return liff
}
export function ensureLineLogin() {
  if (isMockMode()) return true
  if (liff.isLoggedIn()) return true
  liff.login({ redirectUri: window.location.href })
  return false
}
export async function getLineProfile() {
  if (isMockMode()) return { ...MOCK_PROFILE }
  if (!liff.isLoggedIn()) throw new Error('尚未登入 LINE')
  const profile = await liff.getProfile()
  if (!profile.userId) throw new Error('LINE 未提供使用者 ID')
  return { userId: profile.userId, name: profile.displayName, avatar: profile.pictureUrl ?? null }
}
export async function shareJourney() { return { status: 'unavailable' } }
