export default function LineStartupError({ message }) {
  return <main className="login-page">
    <section className="login-panel line-startup-error" aria-labelledby="line-startup-title">
      <p className="demo-badge">LINE MINI App</p>
      <h1 id="line-startup-title">無法啟動 LINE 連線</h1>
      <p>{message}</p>
      <p className="line-startup-hint">請確認部署環境的 LIFF ID 與 LINE Developers Console 目前使用的 Developing、Review 或 Published 環境完全相同。</p>
      <button className="login-submit" type="button" onClick={() => window.location.reload()}>重新載入</button>
    </section>
  </main>
}
