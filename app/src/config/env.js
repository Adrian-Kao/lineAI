export function readEnv() {
  return { liffId: import.meta.env.VITE_LIFF_ID || '', authMode: import.meta.env.VITE_AUTH_MODE || 'line' }
}
