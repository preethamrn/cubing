import assert from 'node:assert/strict'
import test from 'node:test'
import { Alg, Move } from 'cubing/alg'
import { cube3x3x3 } from 'cubing/puzzles'
import { isProxy, shallowRef } from 'vue'
import { ALG_SETS } from '../src/components/AlgTrainer/alg_sets.js'
import { analyzeAlgProgress, buildProcessedAlg, normalizeMove } from '../src/utils/algProgress.js'

test('normalizes incoming moves by notation', () => {
  const normalized = normalizeMove(new Move("R'"))

  assert.ok(normalized instanceof Move)
  assert.equal(normalized.toString(), "R'")
  assert.equal(normalizeMove({ toString: () => 'U2' }).toString(), 'U2')
  assert.equal(normalizeMove({ toString: () => 'not a move' }), null)
})

test('move history stays unproxied across multiple reactive updates', async () => {
  const kpuzzle = await cube3x3x3.kpuzzle()
  const solved = kpuzzle.defaultPattern()
  const alg = new Alg("R U R'")
  const initialPattern = solved.applyAlg(alg.invert().toString())
  const processed = buildProcessedAlg(alg.toString())
  const history = shallowRef([])

  for (const move of alg.experimentalLeafMoves()) {
    history.value = [...history.value, { latestAlgLeaf: normalizeMove(move), timeStamp: 1 }]
    assert.equal(isProxy(history.value.at(-1).latestAlgLeaf), false)
    const result = analyzeAlgProgress(initialPattern, processed, history.value)
    assert.equal(result.completedMoves, history.value.length)
  }

  assert.equal(analyzeAlgProgress(initialPattern, processed, history.value).pattern.isIdentical(solved), true)
})

test('all built-in algorithms solve their case and progress cleanly', async () => {
  const kpuzzle = await cube3x3x3.kpuzzle()
  const solved = kpuzzle.defaultPattern()
  let total = 0

  for (const [setName, set] of Object.entries(ALG_SETS)) {
    for (const item of set.list) {
      const alg = new Alg(item.alg)
      const start = solved.applyAlg(alg.invert())
      const result = start.applyAlg(alg)
      const moves = Array.from(alg.experimentalLeafMoves()).filter((move) => move instanceof Move)
      const events = moves.map((latestAlgLeaf) => ({ latestAlgLeaf, timeStamp: 1 }))
      const processed = buildProcessedAlg(item.alg)

      assert.equal(set.checker(kpuzzle, result, solved), true, `${setName} ${item.name} should solve`)
      if (!processed.some(({ rotation }) => rotation)) {
        const progress = analyzeAlgProgress(start, processed, events)
        assert.equal(progress.completedMoves, moves.length, `${setName} ${item.name} progress count`)
        assert.equal(progress.pattern.isIdentical(solved), true, `${setName} ${item.name} final pattern`)
      }
      total += 1
    }
  }

  assert.ok(total > 500, 'the built-in algorithm collection should remain complete')
})

test('an incorrect move does not prevent progress analysis', async () => {
  const kpuzzle = await cube3x3x3.kpuzzle()
  const solved = kpuzzle.defaultPattern()
  const alg = new Alg("R U R'")
  const start = solved.applyAlg(alg.invert())
  const progress = analyzeAlgProgress(start, buildProcessedAlg(alg.toString()), [
    { latestAlgLeaf: new Move('F'), timeStamp: 1 },
  ])

  assert.equal(progress.totalMoves, 3)
  assert.equal(progress.movesToExecute.length > 0, true)
})

test('progress consumes whole-cube rotations without requiring rotation events', async () => {
  const kpuzzle = await cube3x3x3.kpuzzle()
  const solved = kpuzzle.defaultPattern()
  const alg = new Alg("z D' R2 D R2 U R' D' R U' R U R' D R U' z'")
  const processed = buildProcessedAlg(alg.toString())
  const initial = solved.applyAlg(alg.invert().toString())
  const physicalMoves = processed
    .filter(({ rotation }) => !rotation)
    .map(({ move, mapping }) => {
      const physicalFace = Object.entries(mapping)
        .find(([, algorithmFace]) => algorithmFace === move.family)?.[0]
      return normalizeMove(new Move(physicalFace ?? move.family, move.amount))
    })
  const events = physicalMoves.map((latestAlgLeaf) => ({ latestAlgLeaf, timeStamp: 1 }))
  const progress = analyzeAlgProgress(initial, processed, events)

  assert.notEqual(physicalMoves[0].toString(), "D'")
  assert.equal(progress.completedMoves, processed.length)
  assert.equal(progress.pattern.isIdentical(solved), true)
  assert.equal(ALG_SETS.PLL.checker(kpuzzle, progress.pattern, solved), true)
  assert.ok(progress.movesToExecute.some(({ latestMove }) => latestMove.family === 'z'))
})
