// 文物翻牌配對純規則：不碰儲存、不導航，供元件與 gameRules 共用。
// deck 是 pairId 陣列（每個 pairId 出現兩次）；flips 是依序翻開的牌索引。
import { seedFromString } from '../lantern/lanternRules.js'

export const ARTIFACT_IDS = ['censer', 'lantern', 'fortune', 'moonblocks', 'bell', 'drum', 'incense', 'amulet']
export const DEFAULT_PAIRS = 8

function createRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

// 依 seed 洗牌，同 seed 同牌序。
export function createDeck({ seed = Date.now(), pairs = DEFAULT_PAIRS } = {}) {
  if (!Number.isInteger(pairs) || pairs < 1 || pairs > ARTIFACT_IDS.length) throw new Error('配對數量不正確')
  const random = createRandom(typeof seed === 'number' ? seed : seedFromString(seed))
  const deck = ARTIFACT_IDS.slice(0, pairs).flatMap(id => [id, id])
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function isValidDeck(deck) {
  if (!Array.isArray(deck) || deck.length % 2 !== 0 || !deck.length) return false
  const counts = new Map()
  for (const id of deck) {
    if (!ARTIFACT_IDS.includes(id)) return false
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return [...counts.values()].every(count => count === 2)
}

export function createState(deck) {
  if (!isValidDeck(deck)) throw new Error('牌組不正確')
  return { deck, faceUp: [], matched: [], flips: [], mismatched: false }
}

// 翻一張牌。兩張都翻開後：相同即配對；不同則標記 mismatched，下一次翻牌前先蓋回。
export function flipCard(state, index) {
  const { deck, matched } = state
  if (!Number.isInteger(index) || index < 0 || index >= deck.length) throw new Error('無效的牌位置')
  if (matched.includes(index)) return state
  let faceUp = state.mismatched ? [] : state.faceUp
  if (faceUp.includes(index)) return state
  if (faceUp.length >= 2) return state
  faceUp = [...faceUp, index]
  const flips = [...state.flips, index]
  if (faceUp.length < 2) return { ...state, faceUp, flips, mismatched: false }
  const [a, b] = faceUp
  if (deck[a] === deck[b]) return { ...state, faceUp: [], matched: [...matched, a, b], flips, mismatched: false }
  return { ...state, faceUp, flips, mismatched: true }
}

// 蓋回不配對的兩張（元件在短暫延遲後呼叫）。
export function hideMismatch(state) {
  return state.mismatched ? { ...state, faceUp: [], mismatched: false } : state
}

export function isSolved(state) {
  return Boolean(state?.deck?.length) && state.matched.length === state.deck.length
}

export function countMoves(flips) {
  return Math.floor((flips?.length ?? 0) / 2)
}

// 只憑 evidence 的 deck 與 flips 重放，供整合者驗證完成狀態。
export function replayFlips(deck, flips) {
  if (!isValidDeck(deck) || !Array.isArray(flips)) return null
  return flips.reduce((state, index) => flipCard(state, index), createState(deck))
}

export function isMemorySolved(deck, flips) {
  const state = replayFlips(deck, flips)
  return Boolean(state) && isSolved(state)
}
