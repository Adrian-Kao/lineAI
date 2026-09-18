import liff from '@line/liff'
import { readEnv } from '../config/env.js'

let initPromise
export async function initLine() {
  const { liffId } = readEnv()
  if (!liffId) throw new Error('尚未設定 VITE_LIFF_ID')
  initPromise ??= liff.init({ liffId }).catch(error => { initPromise = undefined; throw error })
  await initPromise
  return liff
}
export function ensureLineLogin() {
  if (liff.isLoggedIn()) return true
  liff.login({ redirectUri: window.location.href })
  return false
}
export async function getLineProfile() {
  if (!liff.isLoggedIn()) throw new Error('尚未登入 LINE')
  const profile = await liff.getProfile()
  if (!profile.userId) throw new Error('LINE 未提供使用者 ID')
  return { userId: profile.userId, name: profile.displayName, avatar: profile.pictureUrl ?? null }
}
export async function shareJourney() { return { status: 'unavailable' } }
