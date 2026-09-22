import { Check, Gamepad2 } from 'lucide-react'
import { useState } from 'react'
import MinigameTask from '../../minigames/MinigameTask.jsx'

export default function GameScene({ config }) {
  const [complete, setComplete] = useState(false)

  return <section className="mission-scene game-scene" aria-labelledby="game-scene-title">
    <div className="mission-scene__heading">
      <span className="scene-kicker">{config.templeName}小挑戰</span>
      <h1 id="game-scene-title">完成小遊戲，解鎖文化故事</h1>
      <p>選擇喜歡的玩法，完成任一款即可通過快速體驗。</p>
    </div>
    <div className="game-scene__icon" aria-hidden="true"><Gamepad2 size={22} /></div>
    <div className="game-scene__game">
      <MinigameTask
        puzzleImageUrl={config.demoPhoto}
        badge="快速體驗"
        description="可自由切換玩法；完成目前選擇的任一遊戲即可通過挑戰。"
        onComplete={() => setComplete(true)}
      />
    </div>
    {complete && <div className="game-scene__complete" role="status"><Check size={21} /><div><strong>遊戲完成</strong><span>你完成了{config.templeName}的連續探索體驗。</span></div></div>}
  </section>
}
