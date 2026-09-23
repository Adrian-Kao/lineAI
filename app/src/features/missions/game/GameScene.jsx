import { Check, Gamepad2 } from 'lucide-react'
import { useState } from 'react'
import MinigameTask from '../../minigames/MinigameTask.jsx'
import { useSettings } from '../../../state/SettingsContext.js'

export default function GameScene({ config }) {
  const { t } = useSettings()
  const templeName = t('experience.temple')
  const [complete, setComplete] = useState(false)

  return <section className="mission-scene game-scene" aria-labelledby="game-scene-title">
    <div className="mission-scene__heading">
      <span className="scene-kicker">{t('gameScene.kicker', { temple: templeName })}</span>
      <h1 id="game-scene-title">{t('gameScene.title')}</h1>
      <p>{t('gameScene.help')}</p>
    </div>
    <div className="game-scene__icon" aria-hidden="true"><Gamepad2 size={22} /></div>
    <div className="game-scene__game">
      <MinigameTask
        puzzleImageUrl={config.demoPhoto}
        badge={t('gameScene.badge')}
        description={t('gameScene.description')}
        onComplete={() => setComplete(true)}
      />
    </div>
    {complete && <div className="game-scene__complete" role="status"><Check size={21} /><div><strong>{t('gameScene.complete')}</strong><span>{t('gameScene.completeBody', { temple: templeName })}</span></div></div>}
  </section>
}
