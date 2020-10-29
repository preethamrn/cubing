<template>
  <div class="scramble">
    <div> {{processedMoves}} </div>
    <div> {{scramble}} </div>
    <div> {{difference}} </div>
  </div>
</template>

<script>
import { algToString, coalesceBaseMoves, parse, BareBlockMove, Sequence } from "cubing/alg"

export default {
  name: "scramble",
  data: () => ({
    processedMoves: [],
  }),
  props: {
    moves: Array,
    scramble: String,
  },
  watch: {
    moves () {
      let processed = this.moves.slice()
      let oldStr = algToString(new Sequence(processed))
      while (true) { // eslint-disable-line
        processed = coalesceBaseMoves(new Sequence(processed)).nestedUnits
        processed = processed.map(v => (new BareBlockMove(v.family, v.amount % 4))).filter(v => v.amount)
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
      let incorrect = this.processedMoves.slice(i, this.processedMoves.length)
      incorrect.reverse()
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

</style>
