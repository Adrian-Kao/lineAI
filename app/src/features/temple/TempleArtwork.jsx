import { Landmark } from 'lucide-react'
import { useSettings } from '../../state/SettingsContext.js'

export default function TempleArtwork() {
  const { t } = useSettings()
  return <div className="temple-artwork" role="img" aria-label={t('temple.imagePending')}><Landmark size={48} strokeWidth={1.3} /><span>{t('temple.imagePending')}</span></div>
}
