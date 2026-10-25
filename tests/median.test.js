import assert from 'node:assert/strict'
import test from 'node:test'
import { parseMedianResults } from '../src/utils/median.js'

test('calculates each session median from its latest 25 solves', () => {
  const solves = Array.from({ length: 26 }, (_, index) => [[0, (index + 1) * 1000]])
  const file = {
    properties: {
      sessionData: JSON.stringify({ 4: { name: '3×3 practice' } }),
    },
    session4: solves,
  }

  assert.deepEqual(parseMedianResults(JSON.stringify(file)), [
    { num: 4, name: '3×3 practice', value: 14, solveCount: 25 },
  ])
})

test('reports malformed timer exports with a useful error', () => {
  assert.throws(
    () => parseMedianResults(JSON.stringify({ session1: [] })),
    /missing session information/i,
  )
})
