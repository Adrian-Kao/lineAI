import { lazy, Suspense, useState } from 'react'
import './minigameTask.css'
import { useSettings } from '../../state/SettingsContext.js'

const GAME_OPTIONS = [
  { id: 'puzzle', labelKey: 'minigame.puzzle', Component: lazy(() => import('./puzzle/PuzzleTask.jsx')) },
  { id: 'lantern', labelKey: 'minigame.lantern', Component: lazy(() => import('./lantern/LanternGame.jsx')) },
  { id: 'maze', labelKey: 'minigame.maze', Component: lazy(() => import('./maze/MazeGame.jsx')) },
  { id: 'memory', labelKey: 'minigame.memory', Component: lazy(() => import('./memory/MemoryGame.jsx')) },
]

export default function MinigameTask({
  onComplete,
  disabled = false,
  puzzleImageUrl,
  badge = '',
  description,
}) {
  const { t } = useSettings()
  const [selectedGame, setSelectedGame] = useState('puzzle')
  const ActiveGame = GAME_OPTIONS.find(option => option.id === selectedGame).Component

  return <div className="mission-minigame">
    <section className="mission-minigame__picker" aria-labelledby="minigame-picker-title">
      <div>
        {badge && <p className="demo-badge">{badge}</p>}
        <h2 id="minigame-picker-title">{t('minigame.choose')}</h2>
        <p>{description ?? t('minigame.defaultDescription')}</p>
      </div>
      <div className="mission-minigame__tabs" role="group" aria-label={t('minigame.type')}>
        {GAME_OPTIONS.map(option => <button
          key={option.id}
          type="button"
          className={`task-button${selectedGame === option.id ? '' : ' is-secondary'}`}
          aria-pressed={selectedGame === option.id}
          disabled={disabled}
          onClick={() => setSelectedGame(option.id)}
        >
          {t(option.labelKey)}
        </button>)}
      </div>
    </section>
    <Suspense fallback={<p className="mission-minigame__loading" role="status">{t('minigame.loading')}</p>}>
      <ActiveGame
        key={selectedGame}
        onComplete={onComplete}
        disabled={disabled}
        {...(selectedGame === 'puzzle' && puzzleImageUrl ? { imageUrl: puzzleImageUrl } : {})}
        {...(selectedGame === 'maze' ? { taskId: 'puzzle' } : {})}
      />
    </Suspense>
  </div>
}
