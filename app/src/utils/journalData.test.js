import test from 'node:test'
import assert from 'node:assert/strict'
import { sortJournalEntries } from '../features/journal/journalData.js'

test('sorts journal entries by visit order before visit time', () => {
  const entries = [
    { id: 'later', visitOrder: 3, visitedAt: '2026-01-01T00:00:00Z' },
    { id: 'second', visitOrder: 2, visitedAt: '2026-03-01T00:00:00Z' },
    { id: 'first', visitOrder: 2, visitedAt: '2026-02-01T00:00:00Z' },
  ]

  assert.deepEqual(sortJournalEntries(entries).map(entry => entry.id), ['first', 'second', 'later'])
  assert.deepEqual(entries.map(entry => entry.id), ['later', 'second', 'first'])
})
