import { Camera, Check, Images, ScanLine, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { compareTemplePatch, getImageSimilarityMode } from '../../../services/imageSimilarity.js'
import { captureHoleRegion, composeReferenceWithPatch } from '../../../utils/mediaCrop.js'
import CameraHole from '../../photo/CameraHole.jsx'
import ReferenceOverlay from '../../photo/ReferenceOverlay.jsx'
import '../../photo/photoAlign.css'
import { delay, MISSION_PHASES } from '../missionFlow.js'
import { useSettings } from '../../../state/SettingsContext.js'

function cameraMessage(t, error) {
  if (!window.isSecureContext) return t('photoDemo.insecure')
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return t('photoDemo.denied')
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') return t('photoDemo.noCamera')
  if (error?.name === 'NotReadableError' || error?.name === 'AbortError') return t('photoDemo.busy')
  return t('photoDemo.cameraFailed')
}

function waitForVideo(video, failedMessage) {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return video.play()
  return new Promise((resolve, reject) => {
    function cleanup() {
      video.removeEventListener('loadedmetadata', ready)
      video.removeEventListener('error', failed)
    }
    function ready() {
      cleanup()
      video.play().then(resolve, reject)
    }
    function failed() {
      cleanup()
      reject(new Error(failedMessage))
    }
    video.addEventListener('loadedmetadata', ready, { once: true })
    video.addEventListener('error', failed, { once: true })
  })
}

function replaceObjectUrl(ref, blob) {
  if (ref.current) URL.revokeObjectURL(ref.current)
  const url = URL.createObjectURL(blob)
  ref.current = url
  return url
}

function revokeObjectUrl(ref) {
  if (!ref.current) return
  URL.revokeObjectURL(ref.current)
  ref.current = ''
}

export default function PhotoDemoScene({ config, phase, onPhaseChange, onContinue, reducedMotion, disabled = false }) {
  const { language, t } = useSettings()
  const templeName = t('experience.temple')
  const task = config.photoTask
  const [cameraStatus, setCameraStatus] = useState('idle')
  const [alignmentStatus, setAlignmentStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [score, setScore] = useState(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [frozenPatchUrl, setFrozenPatchUrl] = useState('')
  const [completionSource, setCompletionSource] = useState('camera')
  const streamRef = useRef(null)
  const videoRef = useRef(null)
  const stageRef = useRef(null)
  const patchUrlRef = useRef('')
  const photoUrlRef = useRef('')
  const completedPhotoRef = useRef(null)
  const albumInputRef = useRef(null)
  const compareAbortRef = useRef(null)
  const checkingRef = useRef(false)
  const autoCheckTimerRef = useRef(null)
  const mountedRef = useRef(true)
  const compareMode = getImageSimilarityMode()
  const dateLabel = useMemo(() => new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), [language])

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => {
    const videoElement = videoRef.current
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      window.clearTimeout(autoCheckTimerRef.current)
      compareAbortRef.current?.abort()
      streamRef.current?.getTracks().forEach(track => track.stop())
      if (videoElement) videoElement.srcObject = null
      revokeObjectUrl(patchUrlRef)
      revokeObjectUrl(photoUrlRef)
    }
  }, [])

  async function startCamera() {
    if (cameraStatus === 'requesting') return
    window.clearTimeout(autoCheckTimerRef.current)
    compareAbortRef.current?.abort()
    stopCamera()
    revokeObjectUrl(patchUrlRef)
    revokeObjectUrl(photoUrlRef)
    setFrozenPatchUrl('')
    setPhotoUrl('')
    completedPhotoRef.current = null
    setMessage('')
    setScore(null)
    setCompletionSource('camera')
    setAlignmentStatus('idle')
    setCameraStatus('requesting')
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error')
      setMessage(cameraMessage(t))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      const video = videoRef.current
      if (!video) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      streamRef.current = stream
      video.srcObject = stream
      await waitForVideo(video, t('photoDemo.videoFailed'))
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      setCameraStatus('ready')
      setAlignmentStatus('aligning')
      setMessage(t('photoDemo.alignHelp'))
      onPhaseChange(MISSION_PHASES.photoReady)
    } catch (error) {
      stopCamera()
      if (!mountedRef.current) return
      setCameraStatus('error')
      setMessage(cameraMessage(t, error))
    }
  }

  const checkAlignment = useCallback(async () => {
    if (phase !== MISSION_PHASES.photoReady || cameraStatus !== 'ready' || checkingRef.current) return
    const video = videoRef.current
    const stage = stageRef.current
    if (!video?.videoWidth || !video?.videoHeight || !stage) return

    checkingRef.current = true
    const controller = new AbortController()
    compareAbortRef.current?.abort()
    compareAbortRef.current = controller
    setAlignmentStatus('checking')
    setMessage(t('photoDemo.comparing'))
    onPhaseChange(MISSION_PHASES.photoCapturing)

    try {
      const capturedPatch = await captureHoleRegion({ video, container: stage, hole: task.hole })
      const result = await compareTemplePatch({
        capturedBlob: capturedPatch,
        referencePatchUrl: task.expectedPatch,
        templeId: task.templeId,
        threshold: task.similarityThreshold,
        signal: controller.signal,
        mode: compareMode,
      })
      if (!mountedRef.current || controller.signal.aborted) return
      setScore(result.score)

      if (!result.passed) {
        setAlignmentStatus('failed')
        setMessage(t('photoDemo.notAligned', { score: Math.round(result.score * 100) }))
        onPhaseChange(MISSION_PHASES.photoReady)
        return
      }

      const completedPhoto = await composeReferenceWithPatch({
        referenceImageUrl: task.referenceImage,
        patchBlob: capturedPatch,
        hole: task.hole,
      })
      if (!mountedRef.current || controller.signal.aborted) return
      setFrozenPatchUrl(replaceObjectUrl(patchUrlRef, capturedPatch))
      setPhotoUrl(task.referenceImage)
      completedPhotoRef.current = completedPhoto
      setAlignmentStatus('matched')
      setMessage(t('photoDemo.aligned'))
      stopCamera()
      await delay(reducedMotion ? 80 : 720, controller.signal)
      if (!mountedRef.current) return
      onPhaseChange(MISSION_PHASES.photoCaptured)
      await delay(reducedMotion ? 100 : 1450, controller.signal)
      if (!mountedRef.current) return
      onPhaseChange(MISSION_PHASES.photoComplete)
    } catch (error) {
      if (!mountedRef.current || error?.name === 'AbortError') return
      setAlignmentStatus('failed')
      setMessage(error instanceof Error ? error.message : t('photoDemo.compareFailed'))
      onPhaseChange(MISSION_PHASES.photoReady)
    } finally {
      checkingRef.current = false
      if (compareAbortRef.current === controller) compareAbortRef.current = null
    }
  }, [cameraStatus, compareMode, onPhaseChange, phase, reducedMotion, t, task])

  useEffect(() => {
    window.clearTimeout(autoCheckTimerRef.current)
    if (phase !== MISSION_PHASES.photoReady || cameraStatus !== 'ready') return undefined
    autoCheckTimerRef.current = window.setTimeout(checkAlignment, reducedMotion ? 180 : 1200)
    return () => window.clearTimeout(autoCheckTimerRef.current)
  }, [cameraStatus, checkAlignment, phase, reducedMotion])

  async function selectAlbumPhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !file.type.startsWith('image/') || checkingRef.current || disabled) return
    window.clearTimeout(autoCheckTimerRef.current)
    compareAbortRef.current?.abort()
    stopCamera()
    revokeObjectUrl(patchUrlRef)
    revokeObjectUrl(photoUrlRef)

    const controller = new AbortController()
    compareAbortRef.current = controller
    checkingRef.current = true
    setCameraStatus('idle')
    setCompletionSource('album')
    setScore(1)
    setFrozenPatchUrl('')
    setPhotoUrl(task.referenceImage)
    completedPhotoRef.current = file
    setAlignmentStatus('matched')
    setMessage(t('photoDemo.albumSelected'))
    onPhaseChange(MISSION_PHASES.photoCapturing)

    try {
      await delay(reducedMotion ? 80 : 720, controller.signal)
      if (!mountedRef.current) return
      onPhaseChange(MISSION_PHASES.photoCaptured)
      await delay(reducedMotion ? 100 : 1450, controller.signal)
      if (!mountedRef.current) return
      onPhaseChange(MISSION_PHASES.photoComplete)
    } catch (error) {
      if (error?.name !== 'AbortError' && mountedRef.current) {
        setAlignmentStatus('failed')
        setMessage(t('photoDemo.albumFailed'))
        onPhaseChange(MISSION_PHASES.photoIntro)
      }
    } finally {
      checkingRef.current = false
      if (compareAbortRef.current === controller) compareAbortRef.current = null
    }
  }

  function finishPhotoTask() {
    if (disabled || !completedPhotoRef.current) return
    onContinue({ blob: completedPhotoRef.current, alignmentScore: score ?? 1, source: completionSource })
  }

  const captured = phase === MISSION_PHASES.photoCaptured
  const complete = phase === MISSION_PHASES.photoComplete
  const cameraReady = phase === MISSION_PHASES.photoReady
  const checking = phase === MISSION_PHASES.photoCapturing && alignmentStatus === 'checking'
  const matched = phase === MISSION_PHASES.photoCapturing && alignmentStatus === 'matched'
  const showAlignmentStage = !captured && !complete
  const holeStyle = {
    left: `${task.hole.x * 100}%`,
    top: `${task.hole.y * 100}%`,
    width: `${task.hole.width * 100}%`,
    height: `${task.hole.height * 100}%`,
  }

  return <section className={`mission-scene photo-demo-scene is-${phase}`} aria-labelledby="photo-demo-title">
    <div className="mission-scene__heading">
      <span className="scene-kicker">{t('photoDemo.kicker')}</span>
      <h1 id="photo-demo-title">{t(complete ? 'photoDemo.completeTitle' : captured ? 'photoDemo.unlockedTitle' : 'photoDemo.title')}</h1>
      <p>{complete ? t('photoDemo.nextGame', { temple: templeName }) : t('photoDemo.help')}</p>
    </div>

    {showAlignmentStage && <div
      className={`photo-align-stage mission-photo-align-stage is-${alignmentStatus}`}
      ref={stageRef}
      style={{ aspectRatio: task.aspectRatio }}
      role="img"
      aria-label={t('photoDemo.stageLabel', { temple: templeName })}
    >
      <CameraHole videoRef={videoRef} hole={task.hole} frozenPatchUrl={frozenPatchUrl} />
      {cameraStatus !== 'ready' && <div className="mission-photo-hole-placeholder" style={holeStyle}><Camera size={25} /><span>{t('photoDemo.camera')}</span></div>}
      <ReferenceOverlay imageUrl={task.referenceImage} hole={task.hole} showHole passed={matched} />
      {checking && <div className="photo-align-stage__checking"><ScanLine size={27} /><span>{t('photoDemo.checking')}</span></div>}
      {matched && photoUrl && <img className="mission-photo-composite" src={photoUrl} alt="" />}
    </div>}

    {(captured || complete) && <div className="photo-memory-stage">
      <figure className="photo-polaroid">
        <img src={photoUrl || task.referenceImage} alt={t('photoDemo.resultAlt', { temple: templeName })} />
        <figcaption><strong>{templeName}</strong><span>{dateLabel}</span><small>{t(completionSource === 'album' ? 'photoDemo.album' : 'photoDemo.sceneComplete')}</small></figcaption>
      </figure>
      <span className="photo-collection-target"><Images size={22} /><small>{t('photoDemo.record')}</small></span>
    </div>}

    {phase === MISSION_PHASES.photoIntro && <div className="photo-demo-actions">
      <button type="button" className="mission-primary-action" onClick={startCamera} disabled={disabled || cameraStatus === 'requesting'}><Camera size={20} />{t(cameraStatus === 'requesting' ? 'photoDemo.opening' : cameraStatus === 'error' ? 'photoDemo.reopen' : 'photoDemo.open')}</button>
      <input ref={albumInputRef} type="file" accept="image/*" hidden onChange={selectAlbumPhoto} />
      <button type="button" className="mission-secondary-action" onClick={() => albumInputRef.current?.click()} disabled={disabled || cameraStatus === 'requesting'}><Images size={20} />{t('photoDemo.chooseAlbum')}</button>
    </div>}

    {(cameraReady || checking) && <div className="mission-photo-alignment-controls">
      <p><ScanLine size={18} />{t('photoDemo.continuous')}</p>
      {Number.isFinite(score) && <div className="mission-photo-score" aria-label={t('photoDemo.score', { score: Math.round(score * 100) })}>
        <span style={{ width: `${Math.round(score * 100)}%` }} />
      </div>}
      <button type="button" className="mission-primary-action" onClick={checkAlignment} disabled={disabled || checking}>{t(checking ? 'photoDemo.checking' : 'photoDemo.check')}</button>
    </div>}

    {message && showAlignmentStage && <p className={`photo-demo-message${alignmentStatus === 'failed' ? ' is-warning' : ''}`} role="status">{message}</p>}
    {captured && <p className="photo-captured-status" role="status"><Check size={18} />{t(completionSource === 'album' ? 'photoDemo.albumSaving' : 'photoDemo.sceneSaving')}</p>}
    {complete && <div className="photo-complete-panel"><p><Check size={18} />{t(completionSource === 'album' ? 'photoDemo.albumUnlocked' : 'photoDemo.sceneUnlocked')}</p><button type="button" className="mission-primary-action mission-next-action" onClick={finishPhotoTask} disabled={disabled}><span>{t('photoDemo.next')}</span></button></div>}
    {!captured && !complete && <p className="photo-demo-privacy"><ShieldCheck size={16} />{t('photoDemo.privacy')}</p>}
  </section>
}
