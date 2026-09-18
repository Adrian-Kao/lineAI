export default function AsyncStatus({ status, message, onRetry }) {
  if (status === 'loading') return <p role="status">載入中…</p>
  if (status === 'error') return <div role="alert"><p>{message || '發生錯誤'}</p>{onRetry && <button onClick={onRetry}>重試</button>}</div>
  if (status === 'empty') return <p>{message || '尚無資料'}</p>
  return null
}
