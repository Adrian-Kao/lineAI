import { ArrowLeft, Code2, Database, ExternalLink, Image, Info, MapPinned, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { useSettings } from '../../state/SettingsContext.js'
import './credits.css'

const COPY = {
  'zh-TW': {
    back: '返回地圖', eyebrow: '公開資訊', title: '資料與授權',
    intro: 'Templore 使用公開資料、地圖圖資與開源軟體呈現台灣宮廟文化。以下說明資料來源、加工方式、授權條件與使用限制。',
    templeTitle: '宮廟點位資料', templeBody: '原始資訊來自內政部宗教資訊網，並透過 kiang/religion 提供的 GeoJSON 資料快照匯入。上游將點位資料標示為 CC BY 授權。',
    templeChange: 'Templore 已修改資料：僅保留「類型＝寺廟」且「教別＝道教／佛教」的有效點位，並正規化縣市名稱、座標與顯示欄位。資料快照擷取於 2026 年 9 月 18 日。',
    moi: '內政部宗教資訊網', repository: 'kiang/religion 資料庫', manifest: '本服務匯入清單', cc: 'CC BY 4.0 授權說明',
    geoTitle: '行政區與地圖圖資', geoBody: '全台縣市輪廓來自 Taiwan.md／waiting7777 的 TopoJSON；縣市與鄉鎮市區邊界另使用 kiang/taiwan_basecode 快照。上述圖資依各上游 MIT 授權使用，並在本服務轉換為 GeoJSON、簡化部分線段及正規化地名。',
    taiwanShape: 'Taiwan.md 台灣圖形', basecode: 'kiang/taiwan_basecode', mit: 'MIT License',
    mapTitle: '道路底圖', mapBody: '縣市放大畫面的道路底圖使用國土測繪中心「國土測繪圖資服務雲」EMAP6 圖磚。地圖左下角保留來源標示；圖磚及地圖內容的權利仍屬原提供單位。', mapSource: '國土測繪圖資服務雲',
    codeTitle: '開源軟體', codeBody: '本服務以 React 與 Vite 建置，並使用 deck.gl、Leaflet、Leaflet.markercluster、TopoJSON Client 與 Lucide。各套件分別依其開源授權使用。使用相同技術不代表複製 kiang/religions 的介面或程式碼。', dependencies: '查看專案套件清單',
    imageTitle: '照片、圖像與文化內容', imageBody: '宮廟點位資料的授權不會自動涵蓋照片、商標、印章、活動圖像或第三方文字。此類素材必須另有授權或明確來源；標示「待補」的 Demo 素材不應視為可自由再利用。',
    noticeTitle: '正確性與非背書聲明', noticeBody: '本服務不是政府機關或宮廟官方網站。公開資料可能有延遲、錯誤或異動，地址、電話、活動與參訪資訊請在出發前向原提供者或宮廟確認。資料來源的列示不表示原提供者為 Templore 背書。',
    privacyTitle: '裝置資料與照片', privacyBody: '目前的探索進度、偏好與個人資料保存在使用者裝置；拍照任務的影像不會自動上傳。若未來改為雲端儲存或新增分析服務，應同步更新隱私說明並取得必要同意。',
    updated: '本頁最後更新：2026 年 9 月 24 日', external: '開啟外部連結：{label}',
  },
  en: {
    back: 'Back to map', eyebrow: 'Public information', title: 'Data & Licenses',
    intro: 'Templore uses public data, map resources, and open-source software to present Taiwan temple culture. This page explains the sources, modifications, license terms, and limitations.',
    templeTitle: 'Temple location data', templeBody: 'The original information comes from the Ministry of the Interior religion database and is imported from GeoJSON snapshots maintained by kiang/religion. The upstream project labels the POI data as CC BY.',
    templeChange: 'Templore modifies this data by retaining valid records where the type is temple and the religion is Taoism or Buddhism, then normalizing place names, coordinates, and display fields. The current snapshot was retrieved on September 18, 2026.',
    moi: 'MOI Religion Information', repository: 'kiang/religion dataset', manifest: 'Import manifest', cc: 'CC BY 4.0 summary',
    geoTitle: 'Administrative boundaries', geoBody: 'The national county outline uses TopoJSON distributed by Taiwan.md and waiting7777. County and district boundaries also use snapshots from kiang/taiwan_basecode. These resources are used under their upstream MIT licenses and are converted to GeoJSON, partially simplified, and normalized for display.',
    taiwanShape: 'Taiwan.md map data', basecode: 'kiang/taiwan_basecode', mit: 'MIT License',
    mapTitle: 'Road basemap', mapBody: 'County views use EMAP6 map tiles from Taiwan’s National Land Surveying and Mapping Center. Source attribution remains visible at the lower-left of the map. Rights in the tiles and map content remain with the provider.', mapSource: 'NLSC Maps',
    codeTitle: 'Open-source software', codeBody: 'Templore is built with React and Vite and uses deck.gl, Leaflet, Leaflet.markercluster, TopoJSON Client, and Lucide. Each package remains subject to its own open-source license. Sharing these technologies does not mean the kiang/religions interface or source code was copied.', dependencies: 'View project dependencies',
    imageTitle: 'Photos and cultural content', imageBody: 'The license for temple location data does not automatically cover photos, trademarks, stamps, event artwork, or third-party writing. These materials require separate permission or clear source information. Demo assets marked as pending should not be treated as freely reusable.',
    noticeTitle: 'Accuracy and no endorsement', noticeBody: 'This service is not an official government or temple website. Public data may be delayed, inaccurate, or changed. Confirm addresses, phone numbers, events, and visiting information with the original provider or temple before travelling. Attribution does not imply endorsement of Templore.',
    privacyTitle: 'Device data and photos', privacyBody: 'Exploration progress, preferences, and profile details are currently stored on the user’s device. Mission photos are not uploaded automatically. Any future cloud storage or analytics must be reflected in an updated privacy notice and appropriate consent flow.',
    updated: 'Page last updated: September 24, 2026', external: 'Open external link: {label}',
  },
}

const URLS = {
  moi: 'https://religion.moi.gov.tw/', repository: 'https://github.com/kiang/religion', manifest: '/data/temples/manifest.json',
  cc: 'https://creativecommons.org/licenses/by/4.0/deed.zh-hant', taiwanShape: 'https://taiwan.md/taiwan-shape/',
  basecode: 'https://github.com/kiang/taiwan_basecode', mit: 'https://opensource.org/license/mit',
  mapSource: 'https://maps.nlsc.gov.tw/', dependencies: 'https://github.com/Adrian-Kao/lineAI/blob/main/app/package.json',
}

function SourceLink({ href, label, externalLabel, license = false }) {
  const external = href.startsWith('http')
  return <a href={href} target={external ? '_blank' : undefined} rel={`${license ? 'license ' : ''}${external ? 'noreferrer' : ''}`.trim() || undefined} aria-label={external ? externalLabel.replace('{label}', label) : undefined}>
    {label}{external && <ExternalLink size={14} aria-hidden="true" />}
  </a>
}

function SourceSection({ icon: Icon, title, children, links, copy }) {
  return <section className="credits-section">
    <div className="credits-section__heading"><Icon size={22} aria-hidden="true" /><h2>{title}</h2></div>
    <div className="credits-section__body">{children}</div>
    {links?.length > 0 && <div className="credits-links">{links.map(link => <SourceLink key={link.key} href={URLS[link.key]} label={copy[link.key]} externalLabel={copy.external} license={link.license} />)}</div>}
  </section>
}

export default function CreditsPage() {
  const { language } = useSettings()
  const copy = COPY[language] ?? COPY['zh-TW']

  return <main className="credits-page">
    <Link className="detail-back" to={ROUTES.map}><ArrowLeft size={19} />{copy.back}</Link>
    <header className="credits-heading"><p>{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.intro}</p></header>

    <div className="credits-source-list">
      <SourceSection icon={Database} title={copy.templeTitle} copy={copy} links={[{ key: 'moi' }, { key: 'repository' }, { key: 'manifest' }, { key: 'cc', license: true }]}>
        <p>{copy.templeBody}</p><p className="credits-change-note"><Info size={17} aria-hidden="true" />{copy.templeChange}</p>
      </SourceSection>
      <SourceSection icon={MapPinned} title={copy.geoTitle} copy={copy} links={[{ key: 'taiwanShape' }, { key: 'basecode' }, { key: 'mit', license: true }]}><p>{copy.geoBody}</p></SourceSection>
      <SourceSection icon={MapPinned} title={copy.mapTitle} copy={copy} links={[{ key: 'mapSource' }]}><p>{copy.mapBody}</p></SourceSection>
      <SourceSection icon={Code2} title={copy.codeTitle} copy={copy} links={[{ key: 'dependencies' }]}><p>{copy.codeBody}</p></SourceSection>
      <SourceSection icon={Image} title={copy.imageTitle} copy={copy}><p>{copy.imageBody}</p></SourceSection>
      <SourceSection icon={ShieldCheck} title={copy.noticeTitle} copy={copy}><p>{copy.noticeBody}</p></SourceSection>
      <SourceSection icon={ShieldCheck} title={copy.privacyTitle} copy={copy}><p>{copy.privacyBody}</p></SourceSection>
    </div>

    <p className="credits-updated">{copy.updated}</p>
  </main>
}
