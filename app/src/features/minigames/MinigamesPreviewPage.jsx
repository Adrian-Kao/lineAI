import { useState } from 'react'
import LanternGame from './lantern/LanternGame.jsx'
import MemoryGame from './memory/MemoryGame.jsx'
import PuzzleTask from './puzzle/PuzzleTask.jsx'
import './minigamesPreview.css'

const GAMES = {
  lantern: { label: '點燈祈福', Component: LanternGame },
  memory: { label: '文物翻牌配對', Component: MemoryGame },
  puzzle: { label: '拼圖', Component: PuzzleTask },
}

export default function MinigamesPreviewPage() {
  const [result, setResult] = useState(null)
  const [game, setGame] = useState('lantern')
  const Game = GAMES[game].Component
  return <main className="mission-page minigames-preview-page">
    <header className="minigames-preview-header">
      <p className="demo-badge">互動遊戲</p>
      <h1>第三關小遊戲</h1>
      <p>選擇遊戲開始體驗，完成後仍可切換其他玩法。</p>
    </header>
    <nav className="minigames-preview-tabs" aria-label="選擇遊戲">
      {Object.entries(GAMES).map(([key, { label }]) => <button key={key} type="button" className={`task-button${game === key ? '' : ' is-secondary'}`} onClick={() => { setGame(key); setResult(null) }}>{label}</button>)}
    </nav>
    <Game key={game} onComplete={setResult} />
    {result && <p className="minigames-preview-result" role="status">遊戲完成，可繼續選擇其他玩法。</p>}
  </main>
}
