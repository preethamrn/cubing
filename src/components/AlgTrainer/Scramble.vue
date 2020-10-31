<template>
  <div class="scramble">
    <span class="correct"> {{algToString(difference.correct)}} </span>
    <span class="incorrect"> {{algToString(difference.incorrect)}} </span>
    <span class="partial"> {{algToString(difference.partial)}} </span>
    <span class="todo"> {{algToString(difference.todo)}} </span>
    {{difference}}
  </div>
</template>

<script>
/* eslint-disable */
import { algToString, coalesceBaseMoves, invert, parse, BareBlockMove, Sequence } from "cubing/alg"
import { KPuzzle, Puzzles, EquivalentTransformations } from "cubing/kpuzzle"

function mergeMappings (currentMapping, newMapping) {
  let merged = {}
  Object.keys(currentMapping).forEach((k) => {
    if (newMapping[k]) merged[k] = currentMapping[newMapping[k]]
    else merged[k] = currentMapping[k]
  })
  return merged
}

function invertMapping (mapping) {
  let inverse = {}
  Object.keys(mapping).forEach((k) => {
    inverse[mapping[k]] = k
  })
  return inverse
}

function fullCoalesceBaseMoves (moves) {
  let processed = moves.slice()
  let oldStr = algToString(new Sequence(processed)), newStr = ''
  while (true) { // eslint-disable-line
    processed = coalesceBaseMoves(new Sequence(processed)).nestedUnits
    processed = processed.map(v => {
      let newAmount = v.amount % 4
      if (newAmount === -2) newAmount = 2
      if (newAmount === -3) newAmount = 1
      if (newAmount === 3) newAmount = -1
      return new BareBlockMove(v.family, newAmount)
    }).filter(v => v.amount)
    let newStr = algToString(new Sequence(processed))
    if (oldStr === newStr) break
    oldStr = newStr
  }
  return processed
}

export default {
  name: "scramble",
  data: () => ({
    // these indices store the values up to (and not including) which have been processed
    lastMoveIndex: 0,
    lastMoveState: null,
    scrambleIndex: 0,
    scrambleState: null,
    incorrectStart: 0,
    difference: {},
  }),
  props: {
    moves: Array,
    scramble: String,
  },
  methods: {
    algToString (moves) {
      if (!moves) return ""
      return algToString(new Sequence(moves))
    },
    findDifference () {
      let i = this.lastMoveIndex, j = this.scrambleIndex
      let partial = [], correct = [], incorrect = [], todo = []
      let movesToExec = []
      while (i < this.moves.length && j < this.processedScramble.length) {
        this.lastMoveState.applyBlockMove(this.moves[i])
        while (j < this.processedScramble.length) {
          let alg = new Sequence(('xyz'.includes(this.processedScramble[j].move.family) ? [] : [this.processedScramble[j].move]).concat(...this.processedScramble[j].rotations))
          this.scrambleState.applyAlg(alg)
          let equivalent = EquivalentTransformations(Puzzles['3x3x3'], this.lastMoveState.state, this.scrambleState.state)
          this.scrambleState.applyAlg(invert(alg))
          if (equivalent) {
            this.scrambleState.applyBlockMove(this.processedScramble[j].move)
            if ('xyzrludfb'.includes(this.processedScramble[j].move.family)) movesToExec.push(this.processedScramble[j].rotations[0])
            this.incorrectStart = i+1
            j++
          } else {
            break
          }
        }
        i++
      }
      correct = this.processedScramble.map(v => v.move).slice(0, j)
      incorrect = fullCoalesceBaseMoves(this.moves.slice(this.incorrectStart, i))
      todo = this.processedScramble.map(v => v.move).slice(j, this.processedScramble.length)
      movesToExec = movesToExec.concat(this.moves.slice(this.lastMoveIndex, i).map(v => (new BareBlockMove(this.processedScramble[j].inverseMapping[v.family], v.amount))))
      this.lastMoveIndex = i
      this.scrambleIndex = j

      console.log(movesToExec)
      this.$emit('execMoves', movesToExec)
      
      this.difference = {
        correct,
        incorrect,
        todo,
        partial,
      }
    },
  },
  watch: {
    moves () {
      this.findDifference()
    },
    processedScramble () {
      // reset puzzle state
      this.lastMoveIndex = 0
      this.lastMoveState = new KPuzzle(Puzzles['3x3x3'])
      this.scrambleIndex = 0
      this.scrambleState = new KPuzzle(Puzzles['3x3x3'])
      this.scrambleState.applyAlg(invert(new Sequence(this.processedScramble[0].rotations)))

      // find initial "difference"
      this.findDifference()
    },
  },
  computed: {
    /// ALGORITHM FOR PROCESSING SCRAMBLE AND COMPUTING DIFFERENCE
    // We only process the scramble to get the orientation state, current move/rotation, and mapping for each move.
    // State = scrambleState, scramblePos (ie, how far have we checked up to in the scramble)
    // Use EquivalentTransformation for each cube move to see which step in the scramble it is equivalent to (if you skip steps, this could cause an issue). The scramble cube state will need to be rotated with the appropriate rotations (tracked by orientation state).
    // Incorrect moves are any extra moves that don't match up. However, if we end up getting a state match, we reset the incorrect moves list.
    // Partial moves are moves where the current inverse mapped move matches with the current scramble move.
    // movesToExec are the inverseMapped cube moves along with any rotations performed at the step (assuming a new step is just completed).
    // Limitations:
    // 1. If user performs any incorrect wide moves/rotations this won't track that and instead will ask the user to perform the inverse single layer turn.
    // 2. Skipping steps or going to a previous step won't work (because we only check EquivalentTransformation for the current step in the scramble).
    processedScramble () {
      let parsed = parse(this.scramble).nestedUnits.slice()
      let processed = []
      let mapping = {R: 'R', L: 'L', F: 'F', B: 'B', U: 'U', D: 'D'}
      let mapRotation = (v) => {
        if (v.family === 'y' && v.amount === -1) mapping = mergeMappings(mapping, {R: 'B', L: 'F', F: 'R', B: 'L'})
        else if (v.family === 'y' && v.amount === 1) mapping = mergeMappings(mapping, {R: 'F', L: 'B', F: 'L', B: 'R'})
        else if (v.family === 'y' && v.amount === 2) mapping = mergeMappings(mapping, {R: 'L', L: 'R', F: 'B', B: 'F'})
        else if (v.family === 'x' && v.amount === -1) mapping = mergeMappings(mapping, {U: 'F', D: 'B', F: 'D', B: 'U'})
        else if (v.family === 'x' && v.amount === 1) mapping = mergeMappings(mapping, {U: 'B', D: 'F', F: 'U', B: 'D'})
        else if (v.family === 'x' && v.amount === 2) mapping = mergeMappings(mapping, {U: 'D', D: 'U', F: 'B', B: 'F'})
        else if (v.family === 'z' && v.amount === -1) mapping = mergeMappings(mapping, {U: 'L', D: 'R', R: 'F', L: 'B'})
        else if (v.family === 'z' && v.amount === 1) mapping = mergeMappings(mapping, {U: 'R', D: 'L', R: 'B', L: 'F'})
        else if (v.family === 'z' && v.amount === 2) mapping = mergeMappings(mapping, {U: 'D', D: 'U', R: 'L', L: 'R'})
      }
      let rotations = []
      parsed.reverse() // process sequence in reverse because future rotations impact the current moves to be performed.
      parsed.forEach(v => {
        let rotationMove = null
        if ('xyz'.includes(v.family)) {
          rotationMove = v
        } else if ('rlfbud'.includes(v.family)) {
          let [opposite, r, amt] = {
            'r': ['L', 'x', 1],
            'l': ['R', 'x', -1],
            'f': ['B', 'z', 1],
            'b': ['F', 'z', -1],
            'u': ['D', 'y', 1],
            'd': ['U', 'y', -1],
          }[v.family]
          v = new BareBlockMove(opposite, v.amount)
          rotationMove = new BareBlockMove(r, amt * v.amount)
        }
        if (rotationMove) {
          mapRotation(rotationMove)
          rotations = [rotationMove, ...rotations]
        }
        // TODO: do we still need mapping + invertMapping? (can we just revere all the mapping moves and use invert instead?)
        processed.push({move: v, rotations, inverseMapping: invertMapping(mapping)})
      })
      
      processed.reverse()
      return processed
    },
    // TODO:
    // test when alg starts with wide move or rotation
    // test with partial moves
    // test with incorrect moves
    // test when two consecutive moves are of same family (eg. r L => L2 x)
  }
}
</script>

<style scoped>
.correct {
  background-color: rgba(0, 255, 0, 1);
}
.incorrect {
  background-color: rgba(255, 0, 0, 1);
}
.partial {
  background-color: rgba(255, 196, 0, 1);
}
.todo {
}
</style>
