import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, ScanLine, ShieldCheck } from 'lucide-react'
import { useGame } from '../../state/GameContext.js'
import { deletePhoto, savePhoto } from '../../services/mediaStorage.js'
import { compareTemplePatch, getImageSimilarityMode } from '../../services/imageSimilarity.js'
import { captureHoleRegion, captureVideoFrame } from '../../utils/mediaCrop.js'
import CameraHole from './CameraHole.jsx'
import ReferenceOverlay from './ReferenceOverlay.jsx'
import PhotoResult from './PhotoResult.jsx'
import { DEFAULT_PHOTO_ALIGN_TASK } from './photoTaskConfig.js'
import './photoAlign.css'

const CHECK_TIMEOUT_MS = 10_000

function cameraErrorMessage(error) {
  if (!window.isSecureContext) return '此頁面需要在 HTTPS 或本機開發環境中使用相機。'
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return '相機權限未開啟。請在瀏覽器網站設定中允許相機後再試一次。'
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') return '找不到可用的相機。請確認裝置有相機並使用支援的瀏覽器。'
  if (error?.name === 'NotReadableError' || error?.name === 'AbortError') return '相機目前可能正被其他 App 使用，請關閉後再試一次。'
  return '無法開啟相機。請確認權限、瀏覽器支援後重新嘗試。'
}

function waitForVideo(video) {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return video.play()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => finish(new Error('相機啟動逾時')), 8_000)
    function cleanup() {
      clearTimeout(timer)
      video.removeEventListener('loadedmetadata', handleReady)
      video.removeEventListener('error', handleError)
    }
    function finish(error) {
      cleanup()
      if (error) reject(error)
      else video.play().then(resolve, reject)
    }
    function handleReady() { finish() }
    function handleError() { finish(new Error('相機畫面載入失敗')) }
    video.addEventListener('loadedmetadata', handleReady, { once: true })
    video.addEventListener('error', handleError, { once: true })
  })
}

export default function PhotoAlignTask({ onComplete, disabled = false, task = DEFAULT_PHOTO_ALIGN_TASK }) {
  const { session } = useGame()
  const [status, setStatus] = useState('permission')
  const [cameraStatus, setCameraStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [score, setScore] = useState(null)
  const [frozenPatchUrl, setFrozenPatchUrl] = useState('')
  const videoRef = useRef(null)
  const stageRef = useRef(null)
  const streamRef = useRef(null)
  const compareAbortRef = useRef(null)
  const successfulFrameRef = useRef(null)
  const mountedRef = useRef(true)
  const compareMode = getImageSimilarityMode()

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => () => {
    mountedRef.current = false
    compareAbortRef.current?.abort()
    streamRef.current?.getTracks().forEach(track => track.stop())
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => () => {
    if (frozenPatchUrl) URL.revokeObjectURL(frozenPatchUrl)
  }, [frozenPatchUrl])

  async function startCamera() {
    if (cameraStatus === 'requesting' || disabled) return
    setMessage('')
    setCameraStatus('requesting')
    setScore(null)
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error')
      setMessage(!window.isSecureContext ? cameraErrorMessage() : '此裝置或瀏覽器暫不支援相機關卡。')
      return
    }

    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await waitForVideo(videoRef.current)
      if (!mountedRef.current) return
      setCameraStatus('ready')
      setStatus('aligning')
    } catch (error) {
      stopCamera()
      if (!mountedRef.current) return
      setCameraStatus(error?.name === 'NotAllowedError' ? 'denied' : 'error')
      setMessage(cameraErrorMessage(error))
      setStatus('permission')
    }
  }

  function clearFrozenPatch() {
    setFrozenPatchUrl(current => {
      if (current) URL.revokeObjectURL(current)
      return ''
    })
  }

  async function checkAlignment() {
    if (status !== 'aligning' || disabled || compareAbortRef.current) return
    setStatus('checking')
    setMessage('')
    setScore(null)

    const controller = new AbortController()
    compareAbortRef.current = controller
    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, CHECK_TIMEOUT_MS)

    try {
      const [capturedBlob, fullFrame] = await Promise.all([
        captureHoleRegion({ video: videoRef.current, container: stageRef.current, hole: task.hole }),
        captureVideoFrame(videoRef.current),
      ])
      clearFrozenPatch()
      setFrozenPatchUrl(URL.createObjectURL(capturedBlob))
      const result = await compareTemplePatch({
        capturedBlob,
        referencePatchUrl: task.expectedPatch,
        templeId: task.templeId,
        threshold: task.similarityThreshold,
        signal: controller.signal,
      })
      if (!mountedRef.current) return
      setScore(result.score)
      if (result.passed) {
        successfulFrameRef.current = fullFrame
        setStatus('passed')
        stopCamera()
      } else {
        clearFrozenPatch()
        setStatus('failed')
      }
    } catch (error) {
      if (!mountedRef.current) return
      clearFrozenPatch()
      setMessage(timedOut ? '比對逾時，請再試一次。' : error?.name === 'AbortError' ? '比對已取消。' : (error.message || '影像比對失敗，請再試一次。'))
      setStatus('failed')
    } finally {
      clearTimeout(timeout)
      if (compareAbortRef.current === controller) compareAbortRef.current = null
    }
  }

  function retryAlignment() {
    if (disabled) return
    clearFrozenPatch()
    setMessage('')
    setScore(null)
    setStatus('aligning')
  }

  async function completeTask() {
    if (status !== 'passed' || disabled || !successfulFrameRef.current) return
    setStatus('completing')
    setMessage('')
    let mediaId = ''
    try {
      mediaId = await savePhoto({ ownerId: session.profile.userId, blob: successfulFrameRef.current })
      await onComplete?.({
        taskId: task.taskId,
        completedAt: new Date().toISOString(),
        evidence: { kind: 'photo', mediaId, alignmentScore: score, compareMode },
      })
    } catch (error) {
      if (mediaId) await deletePhoto({ ownerId: session.profile.userId, mediaId }).catch(() => {})
      if (!mountedRef.current) return
      setMessage(error instanceof Error ? error.message : '照片保存失敗，請再試一次。')
      setStatus('passed')
    }
  }

  const cameraActive = status === 'aligning' || status === 'checking' || status === 'failed'
  const showHole = cameraActive || status === 'passed' || status === 'completing'
  const isDemo = compareMode === 'mock'

  return <section className={`photo-align-task is-${status}`} aria-labelledby="photo-align-title">
    <header className="photo-align-header">
      <div className="photo-align-header__meta">
        <span>{task.templeName}</span>
        {isDemo && <span className="demo-badge">DEMO 比對</span>}
      </div>
      <h2 id="photo-align-title">拍照解鎖</h2>
      <p>{status === 'permission' ? '開啟相機後，將現場建築輪廓對準照片缺口。' : '請移動手機，讓鏡頭中的畫面對準缺口。'}</p>
    </header>

    <div className="photo-align-stage" ref={stageRef} style={{ aspectRatio: task.aspectRatio }} role="img" aria-label={`${task.templeName}參考照片與相機對位缺口`}>
      <CameraHole videoRef={videoRef} hole={task.hole} frozenPatchUrl={frozenPatchUrl} />
      <ReferenceOverlay imageUrl={task.referenceImage} hole={task.hole} showHole={showHole} passed={status === 'passed' || status === 'completing'} />
      {(status === 'passed' || status === 'completing') && <img className="photo-align-stage__completion" src={task.fullReferenceImage} alt="" />}
      {status === 'checking' && <div className="photo-align-stage__checking"><ScanLine size={28} /><span>正在確認位置…</span></div>}
    </div>

    {status === 'permission' && <section className="camera-permission" aria-live="polite">
      <div className="camera-permission__icon">{cameraStatus === 'denied' || cameraStatus === 'error' ? <CameraOff size={28} /> : <Camera size={28} />}</div>
      <div>
        <h3>{cameraStatus === 'denied' || cameraStatus === 'error' ? '無法開啟相機' : '允許相機權限'}</h3>
        <p>{message || '此關卡需要使用相機，請允許相機權限來進行現場對齊。'}</p>
      </div>
      <button type="button" className="task-button" onClick={startCamera} disabled={disabled || cameraStatus === 'requesting'}>
        <Camera size={19} />{cameraStatus === 'requesting' ? '正在開啟…' : cameraStatus === 'idle' ? '開啟相機' : '重新嘗試'}
      </button>
    </section>}

    {(status === 'aligning' || status === 'checking') && <div className="photo-align-actions">
      <p><ScanLine size={18} />對齊入口、牌匾與屋簷輪廓</p>
      <button type="button" className="task-button photo-align-check" onClick={checkAlignment} disabled={disabled || status === 'checking'}>
        {status === 'checking' ? '正在比對…' : '檢查是否對齊'}
      </button>
    </div>}

    {message && status !== 'permission' && <p className="photo-align-message" role="alert">{message}</p>}
    <PhotoResult status={status} score={score} showScore={isDemo} disabled={disabled} onRetry={retryAlignment} onContinue={completeTask} />

    <p className="photo-align-privacy"><ShieldCheck size={17} />只有按下檢查時才會擷取一次畫面；通過後成功畫面會保存於本機圖鑑，不會自動上傳。</p>
  </section>
}
