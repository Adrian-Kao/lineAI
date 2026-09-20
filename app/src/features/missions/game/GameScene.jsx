import { Check, Puzzle } from 'lucide-react'
import { useState } from 'react'
import PuzzleTask from '../../minigames/puzzle/PuzzleTask.jsx'

export default function GameScene({ config }) {
  const [complete, setComplete] = useState(false)

  return <section className="mission-scene game-scene" aria-labelledby="game-scene-title">
    <div className="mission-scene__heading">
      <span className="scene-kicker">{config.templeName}小挑戰・DEMO</span>
      <h1 id="game-scene-title">完成拼圖，解鎖文化故事</h1>
      <p>交換兩塊圖片，將宮廟照片恢復完整。</p>
    </div>
    <div className="game-scene__icon" aria-hidden="true"><Puzzle size={22} /></div>
    <div className="game-scene__puzzle">
      <PuzzleTask imageUrl={config.demoPhoto} onComplete={() => setComplete(true)} />
    </div>
    {complete && <div className="game-scene__complete" role="status"><Check size={21} /><div><strong>DEMO 遊戲完成</strong><span>你完成了{config.templeName}的連續探索體驗。</span></div></div>}
  </section>
}
