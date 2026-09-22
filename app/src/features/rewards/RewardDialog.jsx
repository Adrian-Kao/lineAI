import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Gift, Sparkles } from 'lucide-react'
import './rewardDialog.css'

function RewardVisual({ reward }) {
  if (reward.kind === 'points') return <div className="reward-points-medallion" aria-label={`${reward.amount} LINE POINTS`}>
    <span>LINE</span><strong>{reward.amount}</strong><small>POINTS</small>
  </div>
  if (reward.imageUrl) return <div className={`reward-dialog-image is-${reward.kind}`}>
    <img src={reward.imageUrl} alt={reward.imageAlt ?? ''} />
  </div>
  return <div className="reward-dialog-fallback" aria-hidden="true"><Gift size={50} strokeWidth={1.45} /></div>
}

export default function RewardDialog({ reward, remaining, onConfirm }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!reward) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    confirmRef.current?.focus()
    return () => { document.body.style.overflow = previousOverflow }
  }, [reward])

  if (!reward) return null
  return createPortal(<div className="reward-dialog-layer">
    <section className="reward-dialog" role="dialog" aria-modal="true" aria-labelledby="reward-dialog-title" aria-describedby="reward-dialog-description">
      <div className="reward-dialog-rays" aria-hidden="true" />
      <p className="reward-dialog-eyebrow"><Sparkles size={15} />{reward.eyebrow}</p>
      <RewardVisual reward={reward} />
      <h2 id="reward-dialog-title">{reward.title}</h2>
      <p id="reward-dialog-description" className="reward-dialog-description">{reward.description}</p>
      {remaining > 1 && <p className="reward-dialog-remaining">確認後還有 {remaining - 1} 項獎勵</p>}
      <button ref={confirmRef} className="reward-dialog-confirm" type="button" onClick={onConfirm}>{remaining > 1 ? '確認並查看下一項' : '確認'}</button>
    </section>
  </div>, document.body)
}
