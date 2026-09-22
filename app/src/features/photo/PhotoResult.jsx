import { CircleCheck, RotateCcw } from 'lucide-react'

export default function PhotoResult({ status, score, showScore, disabled, onRetry, onContinue }) {
  if (status !== 'failed' && status !== 'passed' && status !== 'completing') return null
  const passed = status === 'passed' || status === 'completing'

  return <section className={`photo-result is-${passed ? 'passed' : 'failed'}`} aria-live="polite">
    <div className="photo-result__heading">
      {passed ? <CircleCheck size={25} /> : <RotateCcw size={23} />}
      <div>
        <h3>{passed ? '對齊成功' : '還差一點'}</h3>
        <p>{passed ? '找到正確位置了！完整的萬春宮照片已補回。' : '請再調整一下距離或角度，讓入口輪廓接得更自然。'}</p>
      </div>
    </div>
    {showScore && Number.isFinite(score) && <p className="photo-result__score">相似度：{Math.round(score * 100)}%</p>}
    <button type="button" className={`task-button${passed ? '' : ' is-secondary'}`} onClick={passed ? onContinue : onRetry} disabled={disabled || status === 'completing'}>
      {status === 'completing' ? '正在保存…' : passed ? '繼續探索' : '再試一次'}
    </button>
  </section>
}
