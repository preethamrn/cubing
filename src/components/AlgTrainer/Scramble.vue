<template>
  <span class="scramble">
    <div class="name">{{name}}</div>
    <span class="correct"> {{algToString(difference.correct)}} </span>
    <span class="incorrect"> {{algToString(difference.incorrect)}} </span>
    <span class="partial"> {{algToString(difference.partial)}} </span>
    <span class="todo"> {{algToString(difference.todo)}} </span>
  </span>
</template>

<script>
import { algToString, coalesceBaseMoves, invert, parse, BareBlockMove, Sequence } from "cubing/alg"
import { KPuzzle, Puzzles, EquivalentTransformations } from "cubing/kpuzzle"

function mergeMappings (currentMapping, newMapping) {
  let merged = {}
  Object.keys(currentMapping).forEach((k) => {
    if (newMapping[currentMapping[k]]) merged[k] = newMapping[currentMapping[k]]
    else merged[k] = currentMapping[k]
  })
  return merged
}

// eslint-disable-next-line
function invertMapping (mapping) {
  let inverse = {}
  Object.keys(mapping).forEach((k) => {
    inverse[mapping[k]] = k
  })
  return inverse
}

function fullCoalesceBaseMoves (moves) {
  let processed = moves.slice()
  let oldStr = algToString(new Sequence(processed))
  // eslint-disable-next-line
  while (true) {
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
    latestMove: -1, // we need to process multiple moves at a time since we can turn faster than we process moves

    // these indices store the values up to (and not including) which have been processed
    puzzleState: null,
    incorrectMoves: [],
    partialMoves: [],

    scrambleIndex: 0,
    scrambleState: null,

    difference: {},
  }),
  props: {
    moves: Array,
    scramble: String,
    name: String,
    index: Number,
  },
  methods: {
    algToString (moves) {
      if (!moves) return ""
      return algToString(new Sequence(moves))
    },
    reset () {
      // reset puzzle state
      this.latestMove = -1
      this.puzzleState = new KPuzzle(Puzzles['3x3x3'])
      this.puzzleState.applyAlg(invert(parse(this.scramble)))
      this.incorrectMoves = []
      this.partialMoves = []

      this.scrambleIndex = 0
      this.scrambleState = new KPuzzle(Puzzles['3x3x3'])
      this.scrambleState.applyAlg(invert(parse(this.scramble)))
      
      this.difference = {
        correct: [],
        incorrect: [],
        partial: [],
        todo: parse(this.scramble).nestedUnits,
      }
    },
    /// ALGORITHM FOR PROCESSING SCRAMBLE AND COMPUTING DIFFERENCE
    // We only process the scramble to get the orientation state, current move/rotation, and mapping for each move.
    // State = puzzleState, scrambleState, scrambleIndex (ie, how far have we checked up to in the scramble)
    // Start off with puzzleState and scrambleState equivalent to the parent (ie, AlgTrainer) cube state => apply the inverse scramble.
    // Use EquivalentTransformation for each cube move to see which step in the scramble it is equivalent to (if you skip steps, this could cause an issue). The scramble cube state will need to be rotated with the appropriate rotations (tracked by orientation state).
    // Incorrect moves are any extra moves that don't match up. However, if we end up getting a state match, we reset the incorrect moves list.
    // Partial moves are moves where the current mapped move matches with the current scramble move.
    // movesToExec are the mapped cube moves along with any rotations performed at the step (assuming a new step is just completed). Any time we update the puzzleState, we MUST also update movesToExec.
    // Limitations:
    // 1. If user performs any incorrect wide moves/rotations this won't track that and instead will ask the user to perform the inverse single layer turn.
    // 2. Skipping steps or going to a previous step won't work (because we only check EquivalentTransformation for the current step in the scramble).
    findDifference () {
      let j = this.scrambleIndex
      let partial = [], correct = [], incorrect = [], todo = []
      let movesToExec = []

      while (this.latestMove < this.moves.length) {
        let actualMove = null
        if (this.latestMove >= 0) {
          let move = this.moves[this.latestMove].latestMove
          // console.log('processing: ', move)
          actualMove = new BareBlockMove(this.processedScramble[j].mapping[move.family], move.amount)
          this.puzzleState.applyBlockMove(actualMove)
          // We push the entire move event object into movesToExec because we need to keep track of when this move was performed so we get an accurate end time.
          movesToExec.push({latestMove: actualMove, timeStamp: this.moves[this.latestMove].timeStamp})
        }
        while (j < this.processedScramble.length) {
          let alg = {}
          if (!this.processedScramble[j].rotation) {
            alg = new Sequence([this.processedScramble[j].move])
          } else {
            alg = new Sequence([this.processedScramble[j].move, new BareBlockMove(this.processedScramble[j].rotation.family, -this.processedScramble[j].rotation.amount)])
          }
          this.scrambleState.applyAlg(alg)
          let equivalent = EquivalentTransformations(Puzzles['3x3x3'], this.puzzleState.state, this.scrambleState.state)
          if (equivalent) {
            if (this.processedScramble[j].rotation) {
              this.scrambleState.applyBlockMove(this.processedScramble[j].rotation)
              this.puzzleState.applyBlockMove(this.processedScramble[j].rotation)
              movesToExec.push({latestMove: this.processedScramble[j].rotation, timeStamp: this.moves[this.latestMove].timeStamp})
            }
            this.incorrectMoves = []
            this.partialMoves = []
            j++
            actualMove = null // the move has been consumed and we should stop processing it
          } else {
            this.scrambleState.applyAlg(invert(alg))
            // we need to double check if actualMove hasn't already been consumed due to cases like (scramble: U2 y R B, moves: U2 R. the R would show up as an incomplete since we didn't break out of the loop after the equivalence)
            if (actualMove) {
              if (this.incorrectMoves.length == 0 && actualMove.family === this.processedScramble[j].move.family) {
                // store partial for case where there is an incorrect move but the next move is partially correct (eg. scramble: U2 R, moves: U F. We should show incorrect: F' + partial: U2)
                this.partialMoves = [this.processedScramble[j].move]
              } else {
                this.incorrectMoves = fullCoalesceBaseMoves(this.incorrectMoves.concat(actualMove))
              }
            }
            break
          }
        }
        this.latestMove++
      }
      correct = this.processedScramble.map(v => v.move).slice(0, j)
      incorrect = invert(new Sequence(this.incorrectMoves)).nestedUnits
      partial = this.partialMoves
      todo = this.processedScramble.map(v => v.move).slice(j + partial.length, this.processedScramble.length)
      this.scrambleIndex = j

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
      if (this.moves.length > 0) this.findDifference()
    },
    processedScramble () {
      this.reset()
    },
  },
  computed: {
    processedScramble () {
      let parsed = parse(this.scramble).nestedUnits.slice()
      let processed = []
      let mapping = {R: 'R', L: 'L', F: 'F', B: 'B', U: 'U', D: 'D'}
      let mapRotation = (v) => {
        if (v.family === 'y' && v.amount === 1) mapping = mergeMappings(mapping, {R: 'B', L: 'F', F: 'R', B: 'L'})
        else if (v.family === 'y' && v.amount === -1) mapping = mergeMappings(mapping, {R: 'F', L: 'B', F: 'L', B: 'R'})
        else if (v.family === 'y' && Math.abs(v.amount) === 2) mapping = mergeMappings(mapping, {R: 'L', L: 'R', F: 'B', B: 'F'})
        else if (v.family === 'x' && v.amount === 1) mapping = mergeMappings(mapping, {U: 'F', D: 'B', F: 'D', B: 'U'})
        else if (v.family === 'x' && v.amount === -1) mapping = mergeMappings(mapping, {U: 'B', D: 'F', F: 'U', B: 'D'})
        else if (v.family === 'x' && Math.abs(v.amount) === 2) mapping = mergeMappings(mapping, {U: 'D', D: 'U', F: 'B', B: 'F'})
        else if (v.family === 'z' && v.amount === 1) mapping = mergeMappings(mapping, {U: 'L', D: 'R', R: 'U', L: 'D'})
        else if (v.family === 'z' && v.amount === -1) mapping = mergeMappings(mapping, {U: 'R', D: 'L', R: 'D', L: 'U'})
        else if (v.family === 'z' && Math.abs(v.amount) === 2) mapping = mergeMappings(mapping, {U: 'D', D: 'U', R: 'L', L: 'R'})
      }
      parsed.reverse() // process sequence in reverse because future rotations impact the current moves to be performed.
      parsed.forEach(v => {
        let rotation = null
        if ('xyz'.includes(v.family)) {
          rotation = v
        } else if ('rlfbud'.includes(v.family)) {
          let [r, amt] = {
            'r': ['x', 1],
            'l': ['x', -1],
            'f': ['z', 1],
            'b': ['z', -1],
            'u': ['y', 1],
            'd': ['y', -1],
          }[v.family]
          rotation = new BareBlockMove(r, amt * v.amount)
        } else if ('MES'.includes(v.family)) {
          let [r, amt] = {
            'M': ['x', -1],
            'E': ['y', -1],
            'S': ['z', 1],
          }[v.family]
          rotation = new BareBlockMove(r, amt * v.amount)
        }
        if (rotation) {
          mapRotation(rotation)
        }
        processed.push({move: v, rotation, mapping})
      })
      
      processed.reverse()
      return processed
    },
  }
}
</script>

<style scoped>
span::before {
  content: " ";
}
span::after {
  content: " ";
}
.scramble {
  width: 100%;
  padding-top: 15px;
}

.name {
  display: inline-block;
  font-weight: 600;
  padding-right: 40px;
}
.correct {
  color: rgba(0, 255, 0, 1);
}
.incorrect {
  color: rgba(255, 0, 0, 1);
}
.partial {
  color: rgba(255, 196, 0, 1);
}
.todo {
  color: rgb(245, 245, 245);
}
</style>
