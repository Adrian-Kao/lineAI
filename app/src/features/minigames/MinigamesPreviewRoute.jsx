import { lazy, Suspense } from 'react'

const MinigamesPreviewPage = lazy(() => import('./MinigamesPreviewPage.jsx'))

export default function MinigamesPreviewRoute() {
  return <Suspense fallback={<main className="mission-page"><p>載入小遊戲測試頁…</p></main>}>
    <MinigamesPreviewPage />
  </Suspense>
}
