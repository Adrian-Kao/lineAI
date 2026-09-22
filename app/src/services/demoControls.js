export const DEMO_CONTROLS_STORAGE_KEY = 'templore:demo-controls:v1'

export const DEFAULT_DEMO_CONTROLS = Object.freeze({
  centralComplete: false,
  mapColoring: false,
  limitedEvent: false,
  rewardNotifications: false,
})

export function normalizeDemoControls(value) {
  return Object.fromEntries(Object.keys(DEFAULT_DEMO_CONTROLS).map(key => [key, value?.[key] === true]))
}

export function loadDemoControls(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(DEMO_CONTROLS_STORAGE_KEY)
    return raw ? normalizeDemoControls(JSON.parse(raw)) : { ...DEFAULT_DEMO_CONTROLS }
  } catch {
    return { ...DEFAULT_DEMO_CONTROLS }
  }
}

export function saveDemoControls(value, storage = globalThis.localStorage) {
  const normalized = normalizeDemoControls(value)
  try {
    storage?.setItem(DEMO_CONTROLS_STORAGE_KEY, JSON.stringify(normalized))
  } catch {
    // The controls still work for this session when storage is unavailable.
  }
  return normalized
}
