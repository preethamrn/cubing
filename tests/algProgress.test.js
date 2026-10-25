import assert from 'node:assert/strict'
import test from 'node:test'
import { Alg, Move } from 'cubing/alg'
import { cube3x3x3 } from 'cubing/puzzles'
import { ALG_SETS } from '../src/components/AlgTrainer/alg_sets.js'
import { analyzeAlgProgress, buildProcessedAlg } from '../src/utils/algProgress.js'

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
      const progress = analyzeAlgProgress(start, buildProcessedAlg(item.alg), events)

      assert.equal(set.checker(kpuzzle, result, solved), true, `${setName} ${item.name} should solve`)
      assert.equal(progress.completedMoves, moves.length, `${setName} ${item.name} progress count`)
      assert.equal(progress.pattern.isIdentical(solved), true, `${setName} ${item.name} final pattern`)
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
