import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { feature, mesh } from 'topojson-client'

// Derive lightweight overview and per-district detail from the existing source.
// Simplify shared TopoJSON arcs once so neighbouring districts stay joined.
const root = fileURLToPath(new URL('../public/geo/', import.meta.url))
const topology = JSON.parse(fs.readFileSync(`${root}taiwan-districts-20230317.topo.json`))
const object = topology.objects['20230317']
fs.mkdirSync(`${root}districts`, { recursive: true })
for (const geometry of object.geometries) {
  const ids = new Map()
  function rewrite(value) {
    if (Array.isArray(value)) return value.map(rewrite)
    const id = value < 0 ? ~value : value
    if (!ids.has(id)) ids.set(id, ids.size)
    const next = ids.get(id)
    return value < 0 ? ~next : next
  }
  const copy = { ...geometry, arcs: rewrite(geometry.arcs) }
  const subset = { type: 'Topology', transform: topology.transform,
    objects: { '20230317': { type: 'GeometryCollection', geometries: [copy] } },
    arcs: [...ids.keys()].map(id => topology.arcs[id]) }
  fs.writeFileSync(`${root}districts/${geometry.properties.TOWNCODE}.topo.json`, JSON.stringify(subset))
}

function simplify(points, tolerance) {
  const keep = new Set([0, points.length - 1])
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()
    const a = points[first], b = points[last]
    const dx = b[0] - a[0], dy = b[1] - a[1], length = dx * dx + dy * dy
    let max = tolerance * tolerance, index = -1
    for (let i = first + 1; i < last; i++) {
      const p = points[i]
      const t = length ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) : 0
      const distance = (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2
      if (distance > max) { max = distance; index = i }
    }
    if (index !== -1) { keep.add(index); stack.push([first, index], [index, last]) }
  }
  const result = [...keep].sort((a, b) => a - b).map(i => points[i])
  const closed = points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]
  // Keep tiny island rings intact rather than collapsing them into a line.
  return closed && result.length < 4 ? points : result
}

const overview = { ...topology, arcs: topology.arcs.map(arc => {
  let x = 0, y = 0
  const points = arc.map(([dx, dy]) => [x += dx, y += dy])
  const simplified = simplify(points, 60)
  let px = 0, py = 0
  return simplified.map(([x, y]) => {
    const delta = [x - px, y - py]
    px = x; py = y
    return delta
  }) }) }
const collection = feature(overview, overview.objects['20230317'])
if (collection.features.length !== 368) throw new Error('區界數量不符')
fs.writeFileSync(`${root}taiwan-districts-overview.topo.json`, JSON.stringify(overview))
// District data contains unshared internal edges. a === b therefore cannot
// identify coastlines safely; derive the thicker lines from county data only.
const countyTopology = JSON.parse(fs.readFileSync(`${root}taiwan-counties-20200820.topo.json`))
const countyBorders = mesh(countyTopology, countyTopology.objects['20200820'])
fs.writeFileSync(`${root}taiwan-county-borders.geo.json`, JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: countyBorders }] }))
console.log(`總覽 ${Buffer.byteLength(JSON.stringify(overview))} bytes；${overview.arcs.reduce((sum, arc) => sum + arc.length, 0)} 座標點；368 份精細區界`)
