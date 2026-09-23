import { useCallback, useReducer, useRef, useState } from 'react'
import { GameContext } from './GameContext.js'
import { createInitialState, gameReducer } from './gameReducer.js'
import { isTempleInItinerary, validateItineraryTemple, validateTaskResult } from './gameRules.js'
import { clearProgress, loadProgress, saveProgress } from '../services/progressStorage.js'
import { applyProfilePreferences, clearProfilePreferences, loadProfilePreferences, saveProfilePreferences } from '../services/profileStorage.js'
import { buildDemoRewardNotifications, buildRewardNotifications } from '../features/rewards/rewardNotifications.js'
import { loadDemoControls, saveDemoControls } from '../services/demoControls.js'
import { useSettings } from './SettingsContext.js'

const DEV_PUZZLE_PREREQUISITES = {
  stamp: {
    completedAt: '2026-09-19T00:00:00.000Z',
    evidence: { kind: 'stamp', mockTouchConfirmed: true },
  },
  photo: {
    completedAt: '2026-09-19T00:01:00.000Z',
    evidence: { kind: 'photo', mediaId: 'dev-puzzle-prerequisite' },
  },
}

function applyDevPuzzlePrerequisites(snapshot) {
  if (!import.meta.env.DEV || import.meta.env.VITE_SKIP_TO_PUZZLE !== 'true') return snapshot
  return {
    ...snapshot,
    missionCompletions: {
      ...DEV_PUZZLE_PREREQUISITES,
      ...snapshot.missionCompletions,
    },
  }
}

export function GameProvider({ children }) {
  const { language } = useSettings()
  const [progress, dispatch] = useReducer(gameReducer, undefined, () => applyDevPuzzlePrerequisites(createInitialState()))
  const [session, setSession] = useState({ status: 'idle', profile: null, error: null })
  const [rewardQueue, setRewardQueue] = useState([])
  const [demoControls, setDemoControls] = useState(loadDemoControls)
  const progressRef = useRef(progress)
  const submittingRef = useRef(false)
  const initializeSession = useCallback(async function initializeSession(profile) {
    setSession({ status: 'loading', profile: null, error: null })
    try {
      if (!profile?.userId) throw new Error('LINE 個人資料缺少使用者 ID')
      const snapshot = applyDevPuzzlePrerequisites(loadProgress(profile.userId) ?? createInitialState())
      const editableProfile = applyProfilePreferences(profile, loadProfilePreferences(profile.userId))
      progressRef.current = snapshot
      dispatch({ type: 'HYDRATE', payload: snapshot })
      setRewardQueue([])
      setSession({ status: 'ready', profile: editableProfile, error: null })
    } catch (error) {
      setSession({ status: 'error', profile: null, error: error.message })
      throw error
    }
  }, [])
  function updateProfile(input) {
    if (session.status !== 'ready') throw new Error('請先登入 LINE')
    const preferences = saveProfilePreferences(session.profile.userId, input)
    setSession(current => ({
      ...current,
      profile: { ...current.profile, ...preferences },
    }))
    return preferences
  }
  const signOut = useCallback(function signOut() {
    const snapshot = applyDevPuzzlePrerequisites(createInitialState())
    progressRef.current = snapshot
    dispatch({ type: 'HYDRATE', payload: snapshot })
    setRewardQueue([])
    setSession({ status: 'idle', profile: null, error: null })
  }, [])
  function commitProgress(action) {
    const previous = progressRef.current
    const next = gameReducer(previous, action)
    if (next === previous) return next
    saveProgress(session.profile.userId, next)
    progressRef.current = next
    dispatch({ type: 'HYDRATE', payload: next })
    const rewards = buildRewardNotifications(previous, next, language)
    if (rewards.length) setRewardQueue(current => [...current, ...rewards])
    return next
  }
  function addTempleToItinerary(temple) {
    if (session.status !== 'ready') throw new Error('請先登入後再加入行程')
    const identity = validateItineraryTemple(progressRef.current, temple)
    if (isTempleInItinerary(progressRef.current, identity.templeId)) return progressRef.current
    return commitProgress({
      type: 'ADD_ITINERARY_TEMPLE',
      payload: { ...identity, addedAt: new Date().toISOString() },
    })
  }
  function removeTempleFromItinerary(templeId) {
    if (session.status !== 'ready') throw new Error('請先登入後再調整行程')
    return commitProgress({ type: 'REMOVE_ITINERARY_TEMPLE', payload: { templeId } })
  }
  async function completeTask(result) {
    if (session.status !== 'ready') throw new Error('請先登入')
    if (submittingRef.current) throw new Error('任務正在提交，請稍候')
    submittingRef.current = true
    try {
      validateTaskResult(progressRef.current, result)
      return commitProgress({ type: 'TASK_COMPLETED', payload: result })
    } finally {
      submittingRef.current = false
    }
  }
  function completeCollectionMilestone(milestone) {
    if (session.status !== 'ready') throw new Error('請先登入')
    return commitProgress({ type: 'COLLECTION_MILESTONE_COMPLETED', payload: milestone })
  }
  const confirmReward = useCallback(() => setRewardQueue(current => current.slice(1)), [])
  const setDemoControl = useCallback((name, enabled) => {
    setDemoControls(current => saveDemoControls({ ...current, [name]: enabled }))
  }, [])
  const showDemoRewardSequence = useCallback(() => {
    setRewardQueue(buildDemoRewardNotifications(language))
  }, [language])
  const resetCurrentAccount = useCallback(() => {
    if (session.status !== 'ready' || !session.profile?.userId) throw new Error('請先登入要重製的帳號')
    const userId = session.profile.userId
    clearProgress(userId)
    clearProfilePreferences(userId)
    const snapshot = createInitialState()
    progressRef.current = snapshot
    dispatch({ type: 'HYDRATE', payload: snapshot })
    setRewardQueue([])
    setSession(current => ({
      ...current,
      profile: applyProfilePreferences({
        ...current.profile,
        name: current.profile.lineName ?? current.profile.name,
        avatar: current.profile.lineAvatar ?? null,
      }),
    }))
    return snapshot
  }, [session])
  return <GameContext.Provider value={{ progress, session, rewardQueue, demoControls, initializeSession, updateProfile, signOut, completeTask, completeCollectionMilestone, confirmReward, setDemoControl, showDemoRewardSequence, resetCurrentAccount, addTempleToItinerary, removeTempleFromItinerary }}>{children}</GameContext.Provider>
}
