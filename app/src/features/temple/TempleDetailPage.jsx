import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '../../config/routes.js'
import { toDisplayCountyName, toSourceCountyName } from '../../utils/countyNames.js'
import { loadTempleById } from '../../services/templeData.js'
import { templeContentById, missionEnabledTempleIds } from '../../data/templeContent.js'
import TempleArtwork from './TempleArtwork.jsx'

export default function TempleDetailPage() {
  const { county, uuid } = useParams()
  const location = useLocation()
  const [result, setResult] = useState({ key: '', temple: null, error: '' })
  const displayCounty = toDisplayCountyName(county)
  const key = `${displayCounty}:${uuid}`
  const backToMap = toSourceCountyName(displayCounty) ? ROUTES.county.replace(':county', encodeURIComponent(displayCounty)) : ROUTES.map

  useEffect(() => {
    const controller = new AbortController()
    loadTempleById(displayCounty, uuid, controller.signal)
      .then(temple => { if (!controller.signal.aborted) setResult({ key, temple, error: temple ? '' : '找不到這間宮廟' }) })
      .catch(error => { if (!controller.signal.aborted) setResult({ key, temple: null, error: error.message }) })
    return () => controller.abort()
  }, [displayCounty, uuid, key])

  const temple = result.key === key ? result.temple : null
  const content = temple ? templeContentById[temple.id] : null
  const returnPath = temple ? `${backToMap}?${location.state?.returnDistrictId ? `district=${encodeURIComponent(location.state.returnDistrictId)}&` : ''}temple=${encodeURIComponent(temple.id)}` : backToMap
  return <main className="temple-detail-page">
    <Link className="detail-back" to={returnPath} state={{ returnView: location.state?.returnView }}><ArrowLeft size={19} />返回地圖</Link>
    {result.key !== key && <p role="status">宮廟資料載入中…</p>}
    {result.key === key && result.error && <p role="alert">{result.error}</p>}
    {temple && <article className="temple-detail">
      {content?.image && content.imageCredit ? <img src={content.image} alt={temple.name} /> : <TempleArtwork />}
      <h1>{temple.name}</h1>
      <dl>
        <div><dt>宗教分類</dt><dd>{temple.religion}</dd></div>
        {temple.deity && <div><dt>主祀神祇</dt><dd>{temple.deity}</dd></div>}
        {temple.address && <div><dt>地址</dt><dd>{temple.address}</dd></div>}
        {temple.phone && <div><dt>電話</dt><dd>{temple.phone}</dd></div>}
      </dl>
      {content?.history && <section><h2>歷史</h2><p>{content.history}</p></section>}
      {content?.features && <section><h2>特色</h2><p>{content.features}</p></section>}
      {content?.contentSources?.length > 0 && <p>補充內容來源：{content.contentSources.join('、')}</p>}
      {content?.imageCredit && <p>圖片來源：{content.imageCredit}</p>}
      {temple.sourceUrl.startsWith('https://kiang.github.io/religion/data/poi/') && <p className="source-line">資料來源：<a href={temple.sourceUrl} target="_blank" rel="noreferrer">公開宗教場所資料</a></p>}
      <p className="record-line">尚無紀錄</p>
      {missionEnabledTempleIds.has(temple.id) && <button type="button" disabled>探索功能準備中</button>}
    </article>}
  </main>
}
