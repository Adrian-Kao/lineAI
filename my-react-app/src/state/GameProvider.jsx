import { useReducer, useState } from 'react'
import { GameContext } from './GameContext.js'
import { createInitialState, gameReducer } from './gameReducer.js'
import { loadProgress } from '../services/progressStorage.js'
export function GameProvider({ children }) {
  const [progress, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [session, setSession] = useState({ status: 'idle', profile: null, error: null })
  async function initializeSession(profile) {
    const snapshot = loadProgress(profile.userId)
    dispatch({ type: 'HYDRATE', payload: snapshot ?? createInitialState() })
    setSession({ status: 'ready', profile, error: null })
  }
  async function completeTask() { throw new Error('待實作：驗證、序列化提交與保存任務') }
  return <GameContext.Provider value={{ progress, session, initializeSession, completeTask }}>{children}</GameContext.Provider>
}
