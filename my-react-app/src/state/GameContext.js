import { createContext, useContext } from 'react'
export const GameContext = createContext(null)
export function useGame() {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGame 必須在 GameProvider 內使用')
  return value
}
