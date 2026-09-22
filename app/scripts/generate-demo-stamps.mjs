import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const WANCHUN_ID = '51c2c438-6bf2-4d6b-b10f-749ae1e95948'

function escapeXml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function displayName(value) {
  return value
    .replace(/^財團法人/, '')
    .replace(/^(?:臺灣省|台灣省)?(?:臺中市|台中市|臺中|台中)/, '')
    .trim()
}

function stampSvg(title, subtitle, accent = '#B65347') {
  const fontSize = title.length > 8 ? 19 : title.length > 6 ? 22 : title.length > 4 ? 26 : 31
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-labelledby="title">
  <title id="title">${escapeXml(title)}紀念印章</title>
  <g fill="none" stroke="${accent}" stroke-linecap="round" stroke-linejoin="round"><circle cx="120" cy="120" r="101" stroke-width="7"/><circle cx="120" cy="120" r="91" stroke-width="2" stroke-dasharray="3 6"/><path d="M65 88h110M76 88l44-30 44 30M88 88v30m64-30v30M73 118h94" stroke-width="6"/></g>
  <text x="120" y="157" fill="${accent}" font-family="serif" font-size="${fontSize}" font-weight="700" text-anchor="middle">${escapeXml(title)}</text><text x="120" y="183" fill="${accent}" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="3" text-anchor="middle">${escapeXml(subtitle)}</text>
</svg>
`
}

const data = JSON.parse(await readFile(resolve(root, 'public/data/temples/臺中市.json'), 'utf8'))
const centralTemples = data.temples.filter(temple => temple.id !== WANCHUN_ID && /(?:臺中市|台中市)中區/.test(temple.address ?? ''))
const centralDirectory = resolve(root, 'public/stamps/taichung-central')
await mkdir(centralDirectory, { recursive: true })
await Promise.all(centralTemples.map(temple => writeFile(
  resolve(centralDirectory, `${temple.id}.svg`), stampSvg(displayName(temple.name), '台中・中區'), 'utf8',
)))

const routeNames = ['起駕', '彰化', '西螺', '新港', '祝壽', '回程', '安座']
const eventDirectory = resolve(root, 'public/stamps/dajia-event')
await mkdir(eventDirectory, { recursive: true })
await Promise.all(routeNames.map((name, index) => writeFile(
  resolve(eventDirectory, `route-${index + 1}.svg`), stampSvg(name, `遶境・${index + 1}/7`, '#B84937'), 'utf8',
)))

console.log(`Generated ${centralTemples.length} Central District stamps and ${routeNames.length} event stamps.`)
