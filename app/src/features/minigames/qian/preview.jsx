// 開發用獨立預覽：npm run dev 後開 /src/features/minigames/qian/preview.html
// 不經過 MissionPage／GameProvider，只驗證小遊戲本身與 onComplete 回傳值。
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../styles/global.css'
import { SettingsProvider } from '../../../state/SettingsProvider.jsx'
import LanternGame from './LanternGame.jsx'
import MemoryGame from './MemoryGame.jsx'
import PuzzleTask from '../../puzzle/PuzzleTask.jsx'

const GAMES = { lantern: { label: '點燈祈福', Component: LanternGame }, memory: { label: '文物翻牌配對', Component: MemoryGame }, puzzle: { label: '拼圖（姍）', Component: PuzzleTask } }

export default function Preview() {
  const [result, setResult] = useState(null)
  const [game, setGame] = useState('lantern')
  const Game = GAMES[game].Component
  return <main className="mission-page">
    <p style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
      {Object.entries(GAMES).map(([key, { label }]) => <button key={key} type="button" className={`task-button${game === key ? '' : ' is-secondary'}`} onClick={() => { setGame(key); setResult(null) }}>{label}</button>)}
    </p>
    <Game key={game} onComplete={setResult} />
    <details style={{ marginTop: 16, fontSize: 12, color: '#66806a' }}>
      <summary>開發資訊：onComplete 回傳值（正式流程不會顯示）</summary>
      <pre style={{ padding: 12, background: '#fffefa', borderRadius: 8, overflow: 'auto' }}>{result ? JSON.stringify(result, null, 2) : '尚未完成，onComplete 未被呼叫'}</pre>
    </details>
  </main>
}

createRoot(document.getElementById('root')).render(<StrictMode><SettingsProvider><Preview /></SettingsProvider></StrictMode>)
