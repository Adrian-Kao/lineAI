import { useCallback, useReducer, useRef, useState } from 'react'
import { GameContext } from './GameContext.js'
import { createInitialState, gameReducer } from './gameReducer.js'
import { validateTaskResult } from './gameRules.js'
import { loadProgress, saveProgress } from '../services/progressStorage.js'
export function GameProvider({ children }) {
  const [progress, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [session, setSession] = useState({ status: 'idle', profile: null, error: null })
  const progressRef = useRef(progress)
  const submittingRef = useRef(false)
  const initializeSession = useCallback(async function initializeSession(profile) {
    setSession({ status: 'loading', profile: null, error: null })
    try {
      if (!profile?.userId) throw new Error('LINE 個人資料缺少使用者 ID')
      const snapshot = loadProgress(profile.userId) ?? createInitialState()
      progressRef.current = snapshot
      dispatch({ type: 'HYDRATE', payload: snapshot })
      setSession({ status: 'ready', profile, error: null })
    } catch (error) {
      setSession({ status: 'error', profile: null, error: error.message })
      throw error
    }
  }, [])
  async function completeTask(result) {
    if (session.status !== 'ready') throw new Error('請先登入')
    if (submittingRef.current) throw new Error('任務正在提交，請稍候')
    submittingRef.current = true
    try {
      validateTaskResult(progressRef.current, result)
      const next = gameReducer(progressRef.current, { type: 'TASK_COMPLETED', payload: result })
      saveProgress(session.profile.userId, next)
      progressRef.current = next
      dispatch({ type: 'HYDRATE', payload: next })
      return next
    } finally {
      submittingRef.current = false
    }
  }
  return <GameContext.Provider value={{ progress, session, initializeSession, completeTask }}>{children}</GameContext.Provider>
}
