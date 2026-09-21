import { Camera, Check, Image, Images, ScanLine, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { compareTemplePatch, getImageSimilarityMode } from '../../../services/imageSimilarity.js'
import { captureHoleRegion, composeReferenceWithPatch } from '../../../utils/mediaCrop.js'
import CameraHole from '../../photo/CameraHole.jsx'
import ReferenceOverlay from '../../photo/ReferenceOverlay.jsx'
import '../../photo/photoAlign.css'
import { delay, MISSION_PHASES } from '../missionFlow.js'

function cameraMessage(error) {
  if (!window.isSecureContext) return '相機需要 HTTPS 或本機開發環境。'
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return '相機權限未開啟，請在瀏覽器網站設定中允許相機後再試一次。'
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') return '找不到可用的相機，請確認裝置相機可正常使用。'
  if (error?.name === 'NotReadableError' || error?.name === 'AbortError') return '相機可能正在被其他應用程式使用，請關閉後再試一次。'
  return '目前無法開啟相機，請確認權限與瀏覽器支援後再試一次。'
}

function waitForVideo(video) {
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
      reject(new Error('相機畫面載入失敗'))
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

export default function PhotoDemoScene({ config, phase, onPhaseChange, onContinue, reducedMotion }) {
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
  const compareAbortRef = useRef(null)
  const checkingRef = useRef(false)
  const autoCheckTimerRef = useRef(null)
  const mountedRef = useRef(true)
  const compareMode = getImageSimilarityMode()
  const dateLabel = useMemo(() => new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), [])

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
    setMessage('')
    setScore(null)
    setCompletionSource('camera')
    setAlignmentStatus('idle')
    setCameraStatus('requesting')
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error')
      setMessage(cameraMessage())
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
      await waitForVideo(video)
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      setCameraStatus('ready')
      setAlignmentStatus('aligning')
      setMessage('移動手機，讓鏡頭中的牌匾與缺口邊緣重合。')
      onPhaseChange(MISSION_PHASES.photoReady)
    } catch (error) {
      stopCamera()
      if (!mountedRef.current) return
      setCameraStatus('error')
      setMessage(cameraMessage(error))
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
    setMessage('正在比對缺口中的建築輪廓…')
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
        setMessage(`尚未對準，目前相似度 ${Math.round(result.score * 100)}%。請繼續移動鏡頭。`)
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
      setPhotoUrl(replaceObjectUrl(photoUrlRef, completedPhoto))
      setAlignmentStatus('matched')
      setMessage('對位成功，正在把鏡頭畫面補進原始照片。')
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
      setMessage(error instanceof Error ? error.message : '影像比對失敗，請再試一次。')
      onPhaseChange(MISSION_PHASES.photoReady)
    } finally {
      checkingRef.current = false
      if (compareAbortRef.current === controller) compareAbortRef.current = null
    }
  }, [cameraStatus, compareMode, onPhaseChange, phase, reducedMotion, task])

  useEffect(() => {
    window.clearTimeout(autoCheckTimerRef.current)
    if (phase !== MISSION_PHASES.photoReady || cameraStatus !== 'ready') return undefined
    autoCheckTimerRef.current = window.setTimeout(checkAlignment, reducedMotion ? 180 : 1200)
    return () => window.clearTimeout(autoCheckTimerRef.current)
  }, [cameraStatus, checkAlignment, phase, reducedMotion])

  async function completeWithDemoPhoto() {
    if (checkingRef.current) return
    window.clearTimeout(autoCheckTimerRef.current)
    compareAbortRef.current?.abort()
    stopCamera()
    revokeObjectUrl(patchUrlRef)
    revokeObjectUrl(photoUrlRef)

    const controller = new AbortController()
    compareAbortRef.current = controller
    checkingRef.current = true
    setCameraStatus('idle')
    setCompletionSource('demo')
    setScore(1)
    setFrozenPatchUrl(task.expectedPatch)
    setPhotoUrl(task.referenceImage)
    setAlignmentStatus('matched')
    setMessage('DEMO 預設照片已對位，正在補上照片缺口。')
    onPhaseChange(MISSION_PHASES.photoCapturing)

    try {
      await delay(reducedMotion ? 80 : 720, controller.signal)
      if (!mountedRef.current) return
      onPhaseChange(MISSION_PHASES.photoCaptured)
      await delay(reducedMotion ? 100 : 1450, controller.signal)
      if (!mountedRef.current) return
      onPhaseChange(MISSION_PHASES.photoComplete)
    } catch (error) {
      if (error?.name !== 'AbortError') throw error
    } finally {
      checkingRef.current = false
      if (compareAbortRef.current === controller) compareAbortRef.current = null
    }
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
      <span className="scene-kicker">拍照探索・實景對位</span>
      <h1 id="photo-demo-title">{complete ? '拍照探索完成' : captured ? '完整照片已解鎖' : '補上照片缺口'}</h1>
      <p>{complete ? `接下來，完成${config.templeName}的小遊戲吧！` : '將現場鏡頭對準原始照片的缺口，完成後才會解鎖照片。'}</p>
    </div>

    {showAlignmentStage && <div
      className={`photo-align-stage mission-photo-align-stage is-${alignmentStatus}`}
      ref={stageRef}
      style={{ aspectRatio: task.aspectRatio }}
      role="img"
      aria-label={`${task.templeName}原始照片，中央缺口顯示相機即時畫面`}
    >
      <CameraHole videoRef={videoRef} hole={task.hole} frozenPatchUrl={frozenPatchUrl} />
      {cameraStatus !== 'ready' && <div className="mission-photo-hole-placeholder" style={holeStyle}><Camera size={25} /><span>相機畫面</span></div>}
      <ReferenceOverlay imageUrl={task.referenceImage} hole={task.hole} showHole passed={matched} />
      {checking && <div className="photo-align-stage__checking"><ScanLine size={27} /><span>正在確認位置…</span></div>}
      {matched && photoUrl && <img className="mission-photo-composite" src={photoUrl} alt="" />}
    </div>}

    {(captured || complete) && <div className="photo-memory-stage">
      <figure className="photo-polaroid">
        <img src={photoUrl || task.referenceImage} alt={`${config.templeName}實景對位完成照片`} />
        <figcaption><strong>{config.templeName}</strong><span>{dateLabel}</span><small>{completionSource === 'demo' ? 'DEMO 預設照片' : '實景缺口已完成'}</small></figcaption>
      </figure>
      <span className="photo-collection-target"><Images size={22} /><small>旅程紀錄</small></span>
    </div>}

    {phase === MISSION_PHASES.photoIntro && <div className="photo-demo-actions">
      <button type="button" className="mission-primary-action" onClick={startCamera} disabled={cameraStatus === 'requesting'}><Camera size={20} />{cameraStatus === 'requesting' ? '正在開啟…' : cameraStatus === 'error' ? '重新開啟相機' : '開啟相機並開始對位'}</button>
      <button type="button" className="mission-secondary-action" onClick={completeWithDemoPhoto} disabled={cameraStatus === 'requesting'}><Image size={20} />使用預設照片完成 DEMO</button>
    </div>}

    {(cameraReady || checking) && <div className="mission-photo-alignment-controls">
      <p><ScanLine size={18} />系統會持續檢查牌匾與屋簷輪廓</p>
      {Number.isFinite(score) && <div className="mission-photo-score" aria-label={`目前相似度 ${Math.round(score * 100)}%`}>
        <span style={{ width: `${Math.round(score * 100)}%` }} />
      </div>}
      <button type="button" className="mission-primary-action" onClick={checkAlignment} disabled={checking}>{checking ? '正在確認位置…' : '立即檢查對位'}</button>
    </div>}

    {message && showAlignmentStage && <p className={`photo-demo-message${alignmentStatus === 'failed' ? ' is-warning' : ''}`} role="status">{message}</p>}
    {captured && <p className="photo-captured-status" role="status"><Check size={18} />{completionSource === 'demo' ? '預設照片已補齊，正在加入 DEMO 旅程紀錄' : '缺口已補齊，照片正在加入旅程紀錄'}</p>}
    {complete && <div className="photo-complete-panel"><p><Check size={18} />{completionSource === 'demo' ? 'DEMO 預設照片已解鎖' : '實景照片已解鎖'}</p><button type="button" className="mission-primary-action" onClick={onContinue}><span>進入小遊戲</span></button></div>}
    {!captured && !complete && <p className="photo-demo-privacy"><ShieldCheck size={16} />相機缺口只在裝置上比對；預設照片按鈕僅用於 DEMO 展示。</p>}
  </section>
}
