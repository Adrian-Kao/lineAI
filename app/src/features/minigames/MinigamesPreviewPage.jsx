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
      <p className="demo-badge">開發測試頁</p>
      <h1>第三關小遊戲</h1>
      <p>集中測試遊戲元件及其 onComplete 回傳值，不會直接修改玩家任務進度。</p>
    </header>
    <nav className="minigames-preview-tabs" aria-label="選擇測試項目">
      {Object.entries(GAMES).map(([key, { label }]) => <button key={key} type="button" className={`task-button${game === key ? '' : ' is-secondary'}`} onClick={() => { setGame(key); setResult(null) }}>{label}</button>)}
    </nav>
    <Game key={game} onComplete={setResult} />
    <details className="minigames-preview-result">
      <summary>開發資訊：onComplete 回傳值（正式流程不會顯示）</summary>
      <pre>{result ? JSON.stringify(result, null, 2) : '尚未完成，onComplete 未被呼叫'}</pre>
    </details>
  </main>
}
