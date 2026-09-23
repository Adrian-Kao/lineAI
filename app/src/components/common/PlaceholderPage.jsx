import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { useSettings } from '../../state/SettingsContext.js'

export default function PlaceholderPage({ title, titleKey }) {
  const { t } = useSettings()
  return <main className="placeholder-page"><h1>{titleKey ? t(titleKey) : title}</h1><Link className="return-map" to={ROUTES.map}>{t('common.backMap')}</Link></main>
}
