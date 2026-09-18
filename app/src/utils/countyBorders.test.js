import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { mesh } from 'topojson-client'

test('thick boundary layer contains county geometry only, excluding unshared district edges', () => {
  const root = new URL('../../public/geo/', import.meta.url)
  const source = JSON.parse(fs.readFileSync(new URL('taiwan-counties-20200820.topo.json', root)))
  const actual = JSON.parse(fs.readFileSync(new URL('taiwan-county-borders.geo.json', root)))
  assert.equal(source.objects['20200820'].geometries.length, 22)
  assert.equal(actual.features.length, 1)
  assert.deepEqual(actual.features[0].geometry, mesh(source, source.objects['20200820']))
})
