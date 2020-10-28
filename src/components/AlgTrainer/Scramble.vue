<template>
  <div class="scramble">
    <div> {{processedMoves}} </div>
    <div> {{scramble}} </div>
    <div> {{difference}} </div>
  </div>
</template>

<script>
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
      let processed = []
      let lastMove = '-'
      this.moves.forEach((move) => {
        if (lastMove === move.family) {
          //debugger; // eslint-disable-line
          processed[processed.length - 1].amount += move.amount
          if (processed[processed.length - 1].amount === 3) processed[processed.length - 1].amount = -1
          if (processed[processed.length - 1].amount === -2) processed[processed.length - 1].amount = 2
        } else {
          lastMove = move.family
          processed.push(Object.assign({}, move))
        }
      })
      // TODO: fix processedMoves to support canceling recursively (ie. F R' U U' R F => F2)
      this.processedMoves = processed.filter(v => v.amount)
    }
  },
  computed: {
    processedScramble () {
      return this.scramble.split(' ').map((v) => {
        const matches = v.match(/^([RUFLDB])(.?)$/)
        if (!matches) return {} // TODO: handle this error case
        return {
          family: matches[1],
          amount: matches[2] === '2' ? 2 : (matches[2] === "'" ? -1 : matches[2] === "" ? 1 : 4),
        }
      })
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
