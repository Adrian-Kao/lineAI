import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { SOURCE_COUNTY_NAMES } from '../src/utils/countyNames.js'
import { isAllowedTemple, normalizeTemple } from '../src/utils/normalizeTemple.js'

const output = fileURLToPath(new URL('../public/data/temples/', import.meta.url))
const sourceBase = 'https://kiang.github.io/religion/data/poi/'
const listingUrl = 'https://api.github.com/repos/kiang/religion/contents/data/poi'
const commitUrl = 'https://api.github.com/repos/kiang/religion/commits?path=data/poi&per_page=1'

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`)
  return response.json()
}

async function downloadCounties(names, available) {
  const results = new Map()
  let index = 0
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (index < names.length) {
      const name = names[index++]
      if (!available.has(`${name}.json`)) {
        results.set(name, { error: '上游目錄未列出此檔案' })
        continue
      }
      const url = `${sourceBase}${encodeURIComponent(name)}.json`
      try {
        const data = await fetchJson(url)
        if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('資料不是 FeatureCollection')
        results.set(name, { data, url })
      } catch (error) {
        results.set(name, { error: error.message })
      }
    }
  }))
  return results
}

async function main() {
  const startedAt = new Date().toISOString()
  const listing = await fetchJson(listingUrl)
  if (!Array.isArray(listing)) throw new Error('無法取得上游縣市檔案清單')
  const available = new Set(listing.map(item => item.name))
  const commit = await fetchJson(commitUrl).then(items => items?.[0]?.sha ?? null).catch(() => null)
  const downloads = await downloadCounties(SOURCE_COUNTY_NAMES, available)
  const seenIds = new Set()
  const files = []
  await mkdir(output, { recursive: true })

  for (const county of SOURCE_COUNTY_NAMES) {
    const filename = `${county}.json`
    const url = `${sourceBase}${encodeURIComponent(county)}.json`
    const result = downloads.get(county)
    if (result.error) {
      files.push({ county, filename, sourceUrl: url, status: 'failed', error: result.error, originalCount: null, allowedCount: null, invalidCount: null, duplicateCount: null })
      continue
    }
    const errors = {}
    const temples = []
    let allowedCount = 0
    let duplicateCount = 0
    for (const feature of result.data.features) {
      if (!isAllowedTemple(feature)) continue
      allowedCount++
      const normalized = normalizeTemple(feature, county, url)
      if (normalized.error) {
        errors[normalized.error] = (errors[normalized.error] ?? 0) + 1
        continue
      }
      if (seenIds.has(normalized.temple.id)) {
        duplicateCount++
        errors.duplicateUuid = (errors.duplicateUuid ?? 0) + 1
        continue
      }
      seenIds.add(normalized.temple.id)
      temples.push(normalized.temple)
    }
    await writeFile(join(output, filename), JSON.stringify({ county, sourceUrl: url, temples }))
    files.push({ county, filename, sourceUrl: url, status: 'success', originalCount: result.data.features.length, allowedCount, importedCount: temples.length, invalidCount: Object.values(errors).reduce((a, b) => a + b, 0) - duplicateCount, duplicateCount, errors })
  }

  const manifest = {
    sourceRepository: 'https://github.com/kiang/religion',
    sourceDirectory: listingUrl,
    retrievedAt: startedAt,
    sourceCommitSha: commit,
    files,
  }
  await writeFile(join(output, 'manifest.json'), JSON.stringify(manifest, null, 2))
  for (const file of files) console.log(`${file.county}: ${file.status} 原始 ${file.originalCount ?? '-'} / 白名單 ${file.allowedCount ?? '-'} / 匯入 ${file.importedCount ?? '-'} / 無效 ${file.invalidCount ?? '-'} / 重複 ${file.duplicateCount ?? '-'}`)
  if (files.some(file => file.status === 'failed')) process.exitCode = 1
}

main().catch(error => { console.error(`匯入失敗：${error.message}`); process.exitCode = 1 })
