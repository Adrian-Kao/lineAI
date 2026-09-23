import { useSettings } from '../state/SettingsContext.js'

export default function AsyncStatus({ status, message, onRetry }) {
  const { t } = useSettings()
  if (status === 'loading') return <p role="status">{t('common.loading')}</p>
  if (status === 'error') return <div role="alert"><p>{message || t('common.error')}</p>{onRetry && <button onClick={onRetry}>{t('common.retry')}</button>}</div>
  if (status === 'empty') return <p>{message || t('common.noData')}</p>
  return null
}
