import { useState } from 'react'
import { deletePhoto, savePhoto } from '../../services/mediaStorage.js'
import { useGame } from '../../state/GameContext.js'
import { useSettings } from '../../state/SettingsContext.js'
import PhotoDemoScene from '../missions/photo/PhotoDemoScene.jsx'
import { demoMissionConfig, MISSION_PHASES } from '../missions/missionFlow.js'

export default function PhotoTask({ onComplete, disabled = false }) {
  const { session } = useGame()
  const { reduceMotion } = useSettings()
  const [phase, setPhase] = useState(MISSION_PHASES.photoIntro)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function finishPhoto({ blob: capturedBlob, alignmentScore, source }) {
    if (disabled || saving || !(capturedBlob instanceof Blob)) return

    const ownerId = session.profile.userId
    let mediaId = ''
    setSaving(true)
    setError('')

    try {
      const response = await fetch(demoMissionConfig.demoPhoto)
      if (!response.ok) throw new Error('無法載入萬春宮任務照片')
      const referencePhoto = await response.blob()
      mediaId = await savePhoto({ ownerId, blob: referencePhoto })
      await onComplete?.({
        taskId: 'photo',
        completedAt: new Date().toISOString(),
        evidence: {
          kind: 'photo',
          mediaId,
          alignmentScore,
          compareMode: source,
          storedAsset: demoMissionConfig.demoPhoto,
        },
      })
    } catch (cause) {
      if (mediaId) await deletePhoto({ ownerId, mediaId }).catch(() => {})
      setError(cause instanceof Error ? cause.message : '照片儲存失敗，請再試一次。')
      setSaving(false)
    }
  }

  return <>
    <PhotoDemoScene
      config={demoMissionConfig}
      phase={phase}
      onPhaseChange={setPhase}
      onContinue={finishPhoto}
      reducedMotion={reduceMotion}
      disabled={disabled || saving}
    />
    {saving && <p className="mission-status" role="status">正在保存照片…</p>}
    {error && <p className="mission-error" role="alert">{error}</p>}
  </>
}
