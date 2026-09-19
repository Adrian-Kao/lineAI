import test from 'node:test'
import assert from 'node:assert/strict'
import { formatMessage } from './i18n.js'

test('replaces every named placeholder in a translated message', () => {
  assert.equal(
    formatMessage('Missions {completed}/{total}: {completed} done', { completed: 2, total: 3 }),
    'Missions 2/3: 2 done',
  )
})
