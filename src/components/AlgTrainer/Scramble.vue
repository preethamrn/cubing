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
import { algToString, coalesceBaseMoves, invert, parse, BareBlockMove, Sequence } from "cubing/alg"

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

export default {
  name: "scramble",
  data: () => ({
    processedMoves: [],
  }),
  props: {
    moves: Array,
    scramble: String,
  },
  methods: {
    algToString (moves) {
      return algToString(new Sequence(moves))
    }
  },
  watch: {
    moves () {
      let processed = this.moves.slice()
      let oldStr = algToString(new Sequence(processed))
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
        if (newStr === oldStr) break
        else oldStr = newStr
      }

      this.processedMoves = processed
    }
  },
  computed: {
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
      let length = 1
      parsed.reverse() // process sequence in reverse because future rotations impact the current moves to be performed.
      parsed.forEach(v => {
        if ('xyz'.includes(v.family)) {
          mapRotation(v)
          length++
        } else if ('rlfbud'.includes(v.family)) {
          let opposite = '-', r = '-', amt = 0
          if (v.family === 'r') [opposite, r, amt] = ['L', 'x', 1]
          else if (v.family === 'l') [opposite, r, amt] = ['R', 'x', -1]
          else if (v.family === 'f') [opposite, r, amt] = ['B', 'z', 1]
          else if (v.family === 'b') [opposite, r, amt] = ['F', 'z', -1]
          else if (v.family === 'u') [opposite, r, amt] = ['D', 'y', 1]
          else if (v.family === 'd') [opposite, r, amt] = ['U', 'y', -1]
          mapRotation(new BareBlockMove(r, amt))
          processed.push({move: new BareBlockMove(mapping[opposite], v.amount), length, inverseMapping: invertMapping(mapping)})
          length = 1
        } else {
          processed.push({move: new BareBlockMove(mapping[v.family], v.amount), length, inverseMapping: invertMapping(mapping) })
          length = 1
        }
      })
      
      processed.reverse()
      parsed = parsed.reverse()
      return {
        parsed,
        processed,
      }
    },
    // TODO:
    // test when alg starts with wide move or rotation
    // test with partial moves
    // test with incorrect moves
    // test when two consecutive moves are of same family (eg. r L => L2 x)
    difference () {
      let i = 0, j1 = 0, j2 = 0
      let partial = [], correct = []
      let movesToExec = []
      while (i < this.processedMoves.length && i < this.processedScramble.processed.length) {
        if (this.processedMoves[i].family === this.processedScramble.processed[i].move.family) {
          if (this.processedMoves[i].amount !== this.processedScramble.processed[i].move.amount) {
            partial = [this.processedScramble.parsed[j2]]
            i++
            break
          } else {
            movesToExec = this.processedScramble.parsed.slice(j2, j2 + this.processedScramble.processed[i].length)
            correct.push(...movesToExec)
          }
        } else {
          j1 = i
          break
        }
        j2 += this.processedScramble.processed[i].length
        i++
        j1 = i
      }
      let todo = this.processedScramble.parsed.slice(j2, this.processedScramble.parsed.length)
      let incorrect = invert(new Sequence(
        this.processedMoves.slice(j1, this.processedMoves.length).map(v => {
          movesToExec = [new BareBlockMove(this.processedScramble.processed[j1].inverseMapping[v.family], v.amount)]
          return movesToExec[0]
        })
      )).nestedUnits
      this.$emit('execMoves', movesToExec)
      // if (this.processedScramble.parsed)
      return {
        correct,
        incorrect,
        todo,
        partial,
      }
    }
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
