import { ArrowLeft, Languages, Accessibility, Eye, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { useSettings } from '../../state/SettingsContext.js'

function ToggleRow({ icon: Icon, title, description, checked, onChange }) {
  return <label className="settings-row">
    <span className="settings-icon" aria-hidden="true"><Icon size={22} /></span>
    <span className="settings-copy"><strong>{title}</strong><span>{description}</span></span>
    <input className="settings-switch" type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
  </label>
}

export default function SettingsPage() {
  const { language, reduceMotion, highContrast, setSetting, t } = useSettings()
  return <main className="settings-page">
    <Link className="detail-back" to={ROUTES.map}><ArrowLeft size={19} />{t('common.backMap')}</Link>
    <header className="settings-heading"><p>{t('settings.eyebrow')}</p><h1>{t('settings.title')}</h1><p>{t('settings.description')}</p></header>
    <section className="settings-card">
      <div className="settings-section-heading"><Languages size={22} /><div><h2>{t('settings.language')}</h2><p>{t('settings.languageHelp')}</p></div></div>
      <div className="language-options" role="radiogroup" aria-label={t('settings.language')}>
        <label><input type="radio" name="language" value="zh-TW" checked={language === 'zh-TW'} onChange={() => setSetting('language', 'zh-TW')} /><span>{t('settings.chinese')}</span></label>
        <label><input type="radio" name="language" value="en" checked={language === 'en'} onChange={() => setSetting('language', 'en')} /><span>{t('settings.english')}</span></label>
      </div>
    </section>
    <section className="settings-card settings-toggles">
      <ToggleRow icon={Accessibility} title={t('settings.motion')} description={t('settings.motionHelp')} checked={reduceMotion} onChange={value => setSetting('reduceMotion', value)} />
      <ToggleRow icon={Eye} title={t('settings.contrast')} description={t('settings.contrastHelp')} checked={highContrast} onChange={value => setSetting('highContrast', value)} />
    </section>
    <section className="settings-card settings-privacy"><ShieldCheck size={24} /><div><h2>{t('settings.storage')}</h2><p>{t('settings.storageHelp')}</p></div></section>
    <p className="settings-saved" role="status">{t('settings.saved')}</p>
  </main>
}
