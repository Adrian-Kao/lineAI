import { createContext, useContext } from 'react'

export const SettingsContext = createContext(null)

export function useSettings() {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings 必須在 SettingsProvider 內使用')
  return value
}
