import { Alg, Move } from 'cubing/alg'

export function normalizeMove(input) {
  try {
    const notation = typeof input === 'string' ? input : input?.toString?.()
    if (!notation) return null
    return new Move(notation)
  } catch {
    return null
  }
}

function mergeMappings(currentMapping, newMapping) {
  const merged = {}

  for (const [family, mappedFamily] of Object.entries(currentMapping)) {
    merged[family] = newMapping[mappedFamily] || mappedFamily
  }

  return merged
}

function rotationFor(move) {
  const family = move.family

  if ('xyz'.includes(family)) return move

  const rotations = {
    r: ['x', 1],
    l: ['x', -1],
    f: ['z', 1],
    b: ['z', -1],
    u: ['y', 1],
    d: ['y', -1],
    M: ['x', -1],
    E: ['y', -1],
    S: ['z', 1],
  }
  const rotation = rotations[family]

  return rotation ? new Move(rotation[0], rotation[1] * move.amount) : null
}

function rotateMapping(mapping, move) {
  if (move.family === 'y' && move.amount === 1) {
    return mergeMappings(mapping, { R: 'B', L: 'F', F: 'R', B: 'L' })
  }
  if (move.family === 'y' && move.amount === -1) {
    return mergeMappings(mapping, { R: 'F', L: 'B', F: 'L', B: 'R' })
  }
  if (move.family === 'y' && Math.abs(move.amount) === 2) {
    return mergeMappings(mapping, { R: 'L', L: 'R', F: 'B', B: 'F' })
  }
  if (move.family === 'x' && move.amount === 1) {
    return mergeMappings(mapping, { U: 'F', D: 'B', F: 'D', B: 'U' })
  }
  if (move.family === 'x' && move.amount === -1) {
    return mergeMappings(mapping, { U: 'B', D: 'F', F: 'U', B: 'D' })
  }
  if (move.family === 'x' && Math.abs(move.amount) === 2) {
    return mergeMappings(mapping, { U: 'D', D: 'U', F: 'B', B: 'F' })
  }
  if (move.family === 'z' && move.amount === 1) {
    return mergeMappings(mapping, { U: 'L', D: 'R', R: 'U', L: 'D' })
  }
  if (move.family === 'z' && move.amount === -1) {
    return mergeMappings(mapping, { U: 'R', D: 'L', R: 'D', L: 'U' })
  }
  if (move.family === 'z' && Math.abs(move.amount) === 2) {
    return mergeMappings(mapping, { U: 'D', D: 'U', R: 'L', L: 'R' })
  }

  return mapping
}

export function buildProcessedAlg(algString) {
  const parsedMoves = Array.from(new Alg(algString).experimentalLeafMoves())
    .filter((move) => move instanceof Move)
  const processed = []
  let mapping = { R: 'R', L: 'L', F: 'F', B: 'B', U: 'U', D: 'D' }

  for (const move of parsedMoves.slice().reverse()) {
    const rotation = rotationFor(move)
    if (rotation) mapping = rotateMapping(mapping, rotation)
    processed.push({ move, rotation, mapping: { ...mapping } })
  }

  return processed.reverse()
}

function coalesceMoves(moves) {
  const result = []

  for (const move of moves) {
    const previous = result.at(-1)
    if (!previous || previous.family !== move.family) {
      result.push(move)
      continue
    }

    const sum = previous.amount + move.amount
    let amount = ((sum % 4) + 4) % 4
    if (amount === 3) amount = -1

    result.pop()
    if (amount !== 0) result.push(new Move(move.quantum, amount))
  }

  return result
}

/**
 * Replays the move stream against the target algorithm and returns both the
 * move-by-move feedback and the normalized pattern used by the trainer.
 */
export function analyzeAlgProgress(initialPattern, processedAlg, events) {
  const expectedMoves = processedAlg.map(({ move }) => move)
  const inputMoves = events.map((event) => event.latestAlgLeaf ?? event.move)
  const followsTargetPrefix = inputMoves.length <= expectedMoves.length &&
    inputMoves.every((move, index) => move instanceof Move && move.isIdentical(expectedMoves[index]))

  if (followsTargetPrefix) {
    const pattern = initialPattern.applyAlg(new Alg(inputMoves).toString())
    return {
      correct: expectedMoves.slice(0, inputMoves.length),
      incorrect: new Alg(),
      partial: [],
      todo: expectedMoves.slice(inputMoves.length),
      pattern,
      movesToExecute: events.map((event, index) => ({
        latestMove: inputMoves[index],
        timeStamp: event.timeStamp,
      })),
      completedMoves: inputMoves.length,
      totalMoves: expectedMoves.length,
    }
  }

  let puzzlePattern = initialPattern
  let scramblePattern = initialPattern
  let scrambleIndex = 0
  let incorrectMoves = []
  let partialMoves = []
  const movesToExecute = []

  for (const event of events) {
    const inputMove = event.latestAlgLeaf ?? event.move
    if (!(inputMove instanceof Move)) continue

    const nextStep = processedAlg[scrambleIndex]
    const mappedFamily = nextStep?.mapping?.[inputMove.family]
    const actualMove = mappedFamily
      ? new Move(mappedFamily, inputMove.amount)
      : inputMove

    puzzlePattern = puzzlePattern.applyAlg(actualMove.toString())
    movesToExecute.push({ latestMove: actualMove, timeStamp: event.timeStamp })

    let unconsumedMove = actualMove
    while (scrambleIndex < processedAlg.length) {
      const step = processedAlg[scrambleIndex]
      const expectedStep = step.rotation
        ? new Alg([step.move, new Move(step.rotation.family, -step.rotation.amount)])
        : new Alg([step.move])

      scramblePattern = scramblePattern.applyAlg(expectedStep.toString())

      if (puzzlePattern.isIdentical(scramblePattern)) {
        if (step.rotation) {
          scramblePattern = scramblePattern.applyAlg(step.rotation.toString())
          puzzlePattern = puzzlePattern.applyAlg(step.rotation.toString())
          movesToExecute.push({ latestMove: step.rotation, timeStamp: event.timeStamp })
        }

        incorrectMoves = []
        partialMoves = []
        scrambleIndex += 1
        unconsumedMove = null
      } else {
        scramblePattern = scramblePattern.applyAlg(expectedStep.invert().toString())

        if (unconsumedMove) {
          if (
            incorrectMoves.length === 0 &&
            unconsumedMove.family === step.move.family
          ) {
            partialMoves = [step.move]
          } else {
            incorrectMoves = coalesceMoves(incorrectMoves.concat(unconsumedMove))
          }
        }
        break
      }
    }
  }

  const correct = processedAlg.map(({ move }) => move).slice(0, scrambleIndex)
  const incorrect = new Alg(incorrectMoves).invert()
  const todo = processedAlg
    .map(({ move }) => move)
    .slice(scrambleIndex + partialMoves.length)

  return {
    correct,
    incorrect,
    partial: partialMoves,
    todo,
    pattern: puzzlePattern,
    movesToExecute,
    completedMoves: scrambleIndex,
    totalMoves: processedAlg.length,
  }
}

export function algPartToString(moves) {
  if (!moves?.length) return ''
  return new Alg(moves).toString()
}
