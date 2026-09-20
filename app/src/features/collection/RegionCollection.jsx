import { useEffect, useState } from 'react'
import { ChevronDown, LockKeyhole } from 'lucide-react'
import { loadAdministrativeRegions } from '../../services/administrativeRegions.js'

export const DEMO_DISTRICT_ID = '66000010'

export default function RegionCollection({ ariaLabel, emptyLabel, renderDemoDistrict, collapsible = false }) {
  const [result, setResult] = useState({ status: 'loading', regions: [], message: '' })
  useEffect(() => {
    const controller = new AbortController()
    loadAdministrativeRegions(controller.signal)
      .then(regions => setResult({ status: 'ready', regions, message: '' }))
      .catch(error => { if (error.name !== 'AbortError') setResult({ status: 'error', regions: [], message: error.message }) })
    return () => controller.abort()
  }, [])
  if (result.status === 'loading') return <p className="region-collection-status" role="status">行政區資料載入中…</p>
  if (result.status === 'error') return <p className="region-collection-status is-error" role="alert">{result.message}</p>
  return <div className={`region-collection${collapsible ? ' is-collapsible' : ''}`} aria-label={ariaLabel}>
    {result.regions.map(region => {
      const districtGrid = <ul className="region-slot-grid">
        {region.districts.map(district => {
          const isDemoDistrict = district.id === DEMO_DISTRICT_ID
          return <li className={`region-slot${isDemoDistrict ? ' is-demo' : ' is-locked'}`} key={district.id}>
            <h3>{district.name}</h3>
            {isDemoDistrict ? renderDemoDistrict(district) : <div className="region-slot-empty"><LockKeyhole size={20} strokeWidth={1.6} /><span>{emptyLabel}</span></div>}
          </li>
        })}
      </ul>
      return <section className="region-group" key={region.name}>
        {collapsible
          ? <details className="region-group-disclosure">
              <summary className="region-group-header">
                <span className="region-group-heading"><h2>{region.name}</h2><span>{region.districts.length} 個行政區</span></span>
                <ChevronDown className="region-group-chevron" size={21} aria-hidden="true" />
              </summary>
              {districtGrid}
            </details>
          : <><header className="region-group-header"><h2>{region.name}</h2><span>{region.districts.length} 區</span></header>{districtGrid}</>}
      </section>
    })}
  </div>
}
