import { useState } from 'react'
import LanternGame from './lantern/LanternGame.jsx'
import MemoryGame from './memory/MemoryGame.jsx'
import PuzzleTask from './puzzle/PuzzleTask.jsx'
import './minigamesPreview.css'
import { useSettings } from '../../state/SettingsContext.js'

const GAMES = {
  lantern: { labelKey: 'minigame.lantern', Component: LanternGame },
  memory: { labelKey: 'preview.memory', Component: MemoryGame },
  puzzle: { labelKey: 'preview.puzzle', Component: PuzzleTask },
}

export default function MinigamesPreviewPage() {
  const { t } = useSettings()
  const [result, setResult] = useState(null)
  const [game, setGame] = useState('lantern')
  const Game = GAMES[game].Component
  return <main className="mission-page minigames-preview-page">
    <header className="minigames-preview-header">
      <p className="demo-badge">{t('preview.eyebrow')}</p>
      <h1>{t('preview.title')}</h1>
      <p>{t('preview.intro')}</p>
    </header>
    <nav className="minigames-preview-tabs" aria-label={t('preview.choose')}>
      {Object.entries(GAMES).map(([key, { labelKey }]) => <button key={key} type="button" className={`task-button${game === key ? '' : ' is-secondary'}`} onClick={() => { setGame(key); setResult(null) }}>{t(labelKey)}</button>)}
    </nav>
    <Game key={game} onComplete={setResult} />
    {result && <p className="minigames-preview-result" role="status">{t('preview.complete')}</p>}
  </main>
}
