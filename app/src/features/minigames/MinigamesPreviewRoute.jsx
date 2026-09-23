import { lazy, Suspense } from 'react'
import { useSettings } from '../../state/SettingsContext.js'

const MinigamesPreviewPage = lazy(() => import('./MinigamesPreviewPage.jsx'))

export default function MinigamesPreviewRoute() {
  const { t } = useSettings()
  return <Suspense fallback={<main className="mission-page"><p>{t('preview.loading')}</p></main>}>
    <MinigamesPreviewPage />
  </Suspense>
}
