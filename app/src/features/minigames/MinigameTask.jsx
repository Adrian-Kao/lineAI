import { lazy, Suspense, useState } from 'react'
import './minigameTask.css'

const GAME_OPTIONS = [
  { id: 'puzzle', label: '文化拼圖', Component: lazy(() => import('./puzzle/PuzzleTask.jsx')) },
  { id: 'lantern', label: '點燈祈福', Component: lazy(() => import('./lantern/LanternGame.jsx')) },
  { id: 'memory', label: '文物翻牌', Component: lazy(() => import('./memory/MemoryGame.jsx')) },
]

export default function MinigameTask({
  onComplete,
  disabled = false,
  puzzleImageUrl,
  badge = '測試功能',
  description = '可自由切換玩法；完成目前選擇的任一遊戲即可通過第三關。',
}) {
  const [selectedGame, setSelectedGame] = useState('puzzle')
  const ActiveGame = GAME_OPTIONS.find(option => option.id === selectedGame).Component

  return <div className="mission-minigame">
    <section className="mission-minigame__picker" aria-labelledby="minigame-picker-title">
      <div>
        {badge && <p className="demo-badge">{badge}</p>}
        <h2 id="minigame-picker-title">選擇小遊戲</h2>
        <p>{description}</p>
      </div>
      <div className="mission-minigame__tabs" role="group" aria-label="小遊戲類型">
        {GAME_OPTIONS.map(option => <button
          key={option.id}
          type="button"
          className={`task-button${selectedGame === option.id ? '' : ' is-secondary'}`}
          aria-pressed={selectedGame === option.id}
          disabled={disabled}
          onClick={() => setSelectedGame(option.id)}
        >
          {option.label}
        </button>)}
      </div>
    </section>
    <Suspense fallback={<p className="mission-minigame__loading" role="status">載入小遊戲…</p>}>
      <ActiveGame key={selectedGame} onComplete={onComplete} disabled={disabled} {...(selectedGame === 'puzzle' && puzzleImageUrl ? { imageUrl: puzzleImageUrl } : {})} />
    </Suspense>
  </div>
}
