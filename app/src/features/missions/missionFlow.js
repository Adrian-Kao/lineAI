export const MISSION_PHASES = Object.freeze({
  touchWaiting: 'touchWaiting',
  touchDetecting: 'touchDetecting',
  touchSuccess: 'touchSuccess',
  stampEntering: 'stampEntering',
  stampImpact: 'stampImpact',
  stampComplete: 'stampComplete',
  toPhoto: 'toPhoto',
  photoIntro: 'photoIntro',
  photoReady: 'photoReady',
  photoCapturing: 'photoCapturing',
  photoCaptured: 'photoCaptured',
  photoComplete: 'photoComplete',
  gameTransition: 'gameTransition',
  gameReady: 'gameReady',
})

export const demoMissionConfig = Object.freeze({
  templeId: 'wanchun',
  templeName: '萬春宮',
  location: '台中市中區',
  stampImage: '/stamps/wanchun.svg',
  demoPhoto: '/missions/wanchun/reference-full.jpg',
  demoMode: import.meta.env.VITE_MISSION_DEMO_MODE !== 'false',
  game: { type: 'puzzle', gridSize: 2 },
})

export function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Sequence cancelled', 'AbortError'))
      return
    }
    const timer = window.setTimeout(finish, ms)
    function finish() {
      signal?.removeEventListener('abort', cancel)
      resolve()
    }
    function cancel() {
      window.clearTimeout(timer)
      reject(new DOMException('Sequence cancelled', 'AbortError'))
    }
    signal?.addEventListener('abort', cancel, { once: true })
  })
}

function duration(regular, reducedMotion) {
  return reducedMotion ? Math.min(regular, 80) : regular
}

export async function runTouchSequence({ setPhase, signal, reducedMotion }) {
  setPhase(MISSION_PHASES.touchDetecting)
  await delay(duration(950, reducedMotion), signal)
  setPhase(MISSION_PHASES.touchSuccess)
  await delay(duration(460, reducedMotion), signal)
}

export async function runStampSequence({ setPhase, signal, reducedMotion, onImpact }) {
  setPhase(MISSION_PHASES.stampEntering)
  await delay(duration(430, reducedMotion), signal)
  setPhase(MISSION_PHASES.stampImpact)
  onImpact?.()
  await delay(duration(620, reducedMotion), signal)
  setPhase(MISSION_PHASES.stampComplete)
}

export async function runSceneTransition({ destination, setPhase, signal, reducedMotion }) {
  const transitionPhase = destination === 'photo' ? MISSION_PHASES.toPhoto : MISSION_PHASES.gameTransition
  const targetPhase = destination === 'photo' ? MISSION_PHASES.photoIntro : MISSION_PHASES.gameReady
  setPhase(transitionPhase)
  await delay(duration(destination === 'photo' ? 650 : 680, reducedMotion), signal)
  setPhase(targetPhase)
}
