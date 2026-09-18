// A：安裝 LIFF SDK 後，將平台呼叫集中在本檔；不要放 channel secret。
export async function initLine() { throw new Error('待實作：LIFF 初始化') }
export function ensureLineLogin() { throw new Error('待實作：LINE 登入與返回網址') }
export async function getLineProfile() { throw new Error('待實作：取得真實 LINE profile') }
export async function shareJourney() { return { status: 'unavailable' } }
