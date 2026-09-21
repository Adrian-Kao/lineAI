import { Camera, Check, Image, Images, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { delay, MISSION_PHASES } from '../missionFlow.js'

function cameraMessage(error) {
  if (!window.isSecureContext) return '相機需要 HTTPS 或本機開發環境。你仍可使用示範照片完成流程。'
  if (error?.name === 'NotAllowedError') return '相機權限未開啟，你可以改用示範照片。'
  if (error?.name === 'NotFoundError') return '找不到可用相機，你可以改用示範照片。'
  return '目前無法開啟相機，你可以改用示範照片。'
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

export default function PhotoDemoScene({ config, phase, onPhaseChange, onContinue, reducedMotion }) {
  const [cameraStatus, setCameraStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoSource, setPhotoSource] = useState('demo')
  const streamRef = useRef(null)
  const videoRef = useRef(null)
  const ownedUrlRef = useRef('')
  const captureAbortRef = useRef(null)
  const mountedRef = useRef(true)
  const dateLabel = useMemo(() => new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), [])

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => () => {
    mountedRef.current = false
    captureAbortRef.current?.abort()
    streamRef.current?.getTracks().forEach(track => track.stop())
    if (ownedUrlRef.current) URL.revokeObjectURL(ownedUrlRef.current)
  }, [])

  async function startCamera() {
    if (cameraStatus === 'requesting') return
    setCameraStatus('requesting')
    setMessage('')
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error')
      setMessage(cameraMessage())
      return
    }
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
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
      onPhaseChange(MISSION_PHASES.photoReady)
    } catch (error) {
      stopCamera()
      if (!mountedRef.current) return
      setCameraStatus('error')
      setMessage(cameraMessage(error))
    }
  }

  async function runCapture(nextPhotoUrl, source) {
    captureAbortRef.current?.abort()
    const controller = new AbortController()
    captureAbortRef.current = controller
    setPhotoUrl(nextPhotoUrl)
    setPhotoSource(source)
    onPhaseChange(MISSION_PHASES.photoCapturing)
    try {
      await delay(reducedMotion ? 30 : 130, controller.signal)
      stopCamera()
      onPhaseChange(MISSION_PHASES.photoCaptured)
      await delay(reducedMotion ? 80 : 1750, controller.signal)
      onPhaseChange(MISSION_PHASES.photoComplete)
    } catch (error) {
      if (error?.name !== 'AbortError') throw error
    }
  }

  function useDemoPhoto() {
    runCapture(config.demoPhoto, 'demo')
  }

  async function takePhoto() {
    const video = videoRef.current
    if (!video?.videoWidth || !video?.videoHeight) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .9))
    if (!blob) {
      setMessage('照片建立失敗，請再試一次。')
      return
    }
    if (ownedUrlRef.current) URL.revokeObjectURL(ownedUrlRef.current)
    ownedUrlRef.current = URL.createObjectURL(blob)
    runCapture(ownedUrlRef.current, 'camera')
  }

  const captured = phase === MISSION_PHASES.photoCaptured
  const complete = phase === MISSION_PHASES.photoComplete
  const cameraReady = phase === MISSION_PHASES.photoReady

  return <section className={`mission-scene photo-demo-scene is-${phase}`} aria-labelledby="photo-demo-title">
    <div className="mission-scene__heading">
      <span className="scene-kicker">拍照探索・{config.demoMode ? 'DEMO' : 'CAMERA'}</span>
      <h1 id="photo-demo-title">{complete ? '拍照探索完成' : captured ? '拍照完成' : '留下探索紀錄'}</h1>
      <p>{complete ? `接下來，完成${config.templeName}的小遊戲吧！` : `留下你在${config.templeName}的探索紀錄。`}</p>
    </div>

    {!captured && !complete && <div className={`photo-camera-frame${cameraReady ? ' is-live' : ''}`}>
      <video ref={videoRef} playsInline muted aria-label="相機即時預覽" />
      {!cameraReady && <img src={config.demoPhoto} alt={`${config.templeName}示範照片預覽`} />}
      {!cameraReady && <div className="photo-camera-frame__veil"><Camera size={32} /><span>相機預覽</span></div>}
      <i className="camera-corner is-top-left" /><i className="camera-corner is-top-right" /><i className="camera-corner is-bottom-left" /><i className="camera-corner is-bottom-right" />
      {phase === MISSION_PHASES.photoCapturing && <span className="camera-flash" aria-hidden="true" />}
    </div>}

    {(captured || complete) && <div className="photo-memory-stage">
      <figure className="photo-polaroid">
        <img src={photoUrl || config.demoPhoto} alt={`${config.templeName}探索照片`} />
        <figcaption><strong>{config.templeName}</strong><span>{dateLabel}</span>{photoSource === 'demo' && <small>DEMO 示範照片</small>}</figcaption>
      </figure>
      <span className="photo-collection-target"><Images size={22} /><small>旅程紀錄</small></span>
    </div>}

    {phase === MISSION_PHASES.photoIntro && <div className="photo-demo-actions">
      <button type="button" className="mission-primary-action" onClick={startCamera} disabled={cameraStatus === 'requesting'}><Camera size={20} />{cameraStatus === 'requesting' ? '正在開啟…' : '開啟相機'}</button>
      <button type="button" className="mission-secondary-action" onClick={useDemoPhoto}><Image size={20} />使用示範照片</button>
    </div>}

    {cameraReady && <div className="photo-demo-actions">
      <button type="button" className="mission-primary-action" onClick={takePhoto}><Camera size={20} />拍照</button>
      <button type="button" className="mission-secondary-action" onClick={useDemoPhoto}><Image size={20} />改用示範照片</button>
    </div>}

    {message && <p className="photo-demo-message" role="alert">{message}</p>}
    {captured && <p className="photo-captured-status" role="status"><Check size={18} />照片正在加入旅程紀錄</p>}
    {complete && <div className="photo-complete-panel"><p><Check size={18} />照片已加入本次 DEMO 旅程</p><button type="button" className="mission-primary-action" onClick={onContinue}><span>進入小遊戲</span></button></div>}
    {!captured && !complete && <p className="photo-demo-privacy"><ShieldCheck size={16} />照片僅在本次流程記憶體中使用，不會寫入正式圖鑑。</p>}
  </section>
}
