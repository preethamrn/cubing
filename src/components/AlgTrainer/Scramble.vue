<template>
  <div class="scramble">
    <span v-for='(move, index) in scramble' :key='index'>
      {{move}}&nbsp;
    </span>
    <div> {{processedMoves}} </div>
  </div>
</template>

<script>
export default {
  name: "scramble",
  data: () => ({
    processedMoves: '',
  }),
  props: {
    moves: Array,
    scramble: Array,
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
      this.processedMoves = processed.filter(v => v.amount).map(v => (v.family + (v.amount === -1 ? "'" : (v.amount === 1 ? '' : v.amount)))).reduce((acc, v) => (acc + v + ' '), '')
    }
  },
}
</script>

<style scoped>

</style>
