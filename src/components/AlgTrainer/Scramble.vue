<template>
  <div class="scramble">
    <span class="correct"> {{algToString(difference.correct)}} </span>
    <span class="incorrect"> {{algToString(difference.incorrect)}} </span>
    <span class="partial"> {{algToString(difference.partial)}} </span>
    <span class="todo"> {{algToString(difference.todo)}} </span>
  </div>
</template>

<script>
import { algToString, coalesceBaseMoves, invert, parse, BareBlockMove, Sequence } from "cubing/alg"

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
      return parse(this.scramble).nestedUnits
    },
    // TODO: process wide moves, slice moves, and rotations.
    difference () {
      let i = 0, j = 0
      let partial = []
      while (i < this.processedMoves.length && i < this.processedScramble.length) {
        if (this.processedMoves[i].family === this.processedScramble[i].family) {
          if (this.processedMoves[i].amount !== this.processedScramble[i].amount) {
            partial = [this.processedScramble[i]]
            i++
            break
          }
        } else {
          j = i
          break
        }
        i++
        j = i
      }
      let correct = this.processedMoves.slice(0, j)
      let todo = this.processedScramble.slice(i, this.processedScramble.length)
      let incorrect = invert(new Sequence(this.processedMoves.slice(i, this.processedMoves.length))).nestedUnits
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
