import { ChevronDown } from 'lucide-react'
import StampCard from './StampCard.jsx'
import { useSettings } from '../../state/SettingsContext.js'
import { localizeCountyName, localizeDistrictName, localizeRegionLabel } from '../../utils/regionNames.js'

const TAICHUNG_DEMO_DISTRICTS = ['中區', '北區', '西區']

function orderDistricts(county, districts) {
  if (county !== '台中市') return districts
  const priority = new Map(TAICHUNG_DEMO_DISTRICTS.map((district, index) => [district, index]))
  return [...districts].sort((left, right) => {
    const leftPriority = priority.get(left.name)
    const rightPriority = priority.get(right.name)
    if (leftPriority !== undefined || rightPriority !== undefined) return (leftPriority ?? 999) - (rightPriority ?? 999)
    return left.id.localeCompare(right.id)
  })
}

export default function StampGrid({ entries, regions, onSelect }) {
  const { language, t } = useSettings()
  const groups = regions.map(region => ({
    county: region.name,
    districts: orderDistricts(region.name, region.districts).map(district => {
      const stamps = entries.filter(entry => entry.county === region.name && entry.district === district.name)
      return {
        ...district,
        stamps,
      }
    }),
  }))

  if (!groups.length) return <div className="stamp-grid-empty" role="status"><strong>{t('stampbook.noMatches')}</strong><span>{t('stampbook.adjust')}</span></div>
  return <div className="stamp-county-list" aria-label={t('stampbook.aria')}>
    {groups.map(group => {
      const completedDistricts = group.districts.filter(district => district.stamps.length > 0 && district.stamps.every(entry => entry.collected)).length
      return <details className="stamp-county" key={group.county}>
        <summary className="stamp-county-summary">
          <span><strong>{localizeCountyName(group.county, language)}</strong><small>{t('stampbook.completedDistricts', { completed: completedDistricts, total: group.districts.length })}</small></span>
          <ChevronDown size={21} aria-hidden="true" />
        </summary>
        <div className="stamp-district-list">
          {group.districts.map(district => <section className={`stamp-district${district.stamps.length ? '' : ' is-empty'}`} key={`${group.county}-${district.name}`}>
            <header><h2>{localizeDistrictName(district, language)}</h2><span>{district.stamps.length ? t('stampbook.templeCount', { count: district.stamps.length }) : t('stampbook.none')}</span></header>
            {district.stamps.length > 0 && <div className="stamp-grid">{district.stamps.map(entry => <StampCard key={entry.templeId} entry={{ ...entry, locationLabel: localizeRegionLabel(group.county, district, language) }} onSelect={onSelect} />)}</div>}
          </section>)}
        </div>
      </details>
    })}
  </div>
}
