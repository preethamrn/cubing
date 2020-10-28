<template>
  <div class="algtrainer">
    <button @click='connect'>Connect</button>
    <scramble :scramble='scramble' :moves='moves' />
    <div id='twisty'></div>
  </div>
</template>

<script>
import { Sequence, BareBlockMove } from "cubing/alg"
import {
  connect,
  debugKeyboardConnect,
} from "cubing/bluetooth"
import { KPuzzle, Puzzles, EquivalentTransformations } from "cubing/kpuzzle"
import { TwistyPlayer } from "cubing/twisty"
import Scramble from "../components/AlgTrainer/Scramble"

async function asyncSetup(twistyPlayer) {
  console.log("asyncSetup")
  const keyboard = await debugKeyboardConnect(twistyPlayer) // TODO: attach to viewer only?
  console.log("keyboard", twistyPlayer, keyboard)
  keyboard.addMoveListener((e) => {
    console.log("listener", e)
    twistyPlayer.experimentalAddMove(e.latestMove)
  })
}

export default {
  name: "algtrainer",
  components: {
    Scramble,
  },
  data: () => ({
    twistyPlayer: null, // TODO: display just the cube and not the entire player window
    scramble: "R U2 R' U2 R' U' R U R U' R' U2 R' U2 R",
    moves: [],
    puzzleState: null,
  }),
  methods: {
    async connect () {
      const acceptAllDevices = false
      window.puzzle = await connect({ acceptAllDevices })
      window.puzzle.addMoveListener((e) => {
        this.twistyPlayer.experimentalAddMove(e.latestMove)
        this.moves.push(e.latestMove)
        this.puzzleState.applyBlockMove(e.latestMove)
        // TODO: use cubing/kpuzzle or cube.js to figure out if the cube is in a solved state after applying all the moves.
        console.log(e.latestMove)
      })
      // window.puzzle.addOrientationListener(() => {
      //   // TODO
      // })
    }
  },
  mounted () {
    document.addEventListener('keydown', (e) => {
      console.log(e)
      if ('urfdlbURFDLB'.split('').includes(e.key)) {
        let m = BareBlockMove(e.key.toUpperCase(), 1)
        this.moves.push(m)
        this.puzzleState.applyBlockMove(m)
        console.log("Cube is solved: ", EquivalentTransformations(Puzzles['3x3x3'], this.puzzleState.state, new KPuzzle(Puzzles['3x3x3']).state))
      }
    })
    this.puzzleState = new KPuzzle(Puzzles['3x3x3'])
    this.twistyPlayer = new TwistyPlayer({ alg: new Sequence([]) })
    document.querySelector('#twisty').appendChild(this.twistyPlayer)
    
    asyncSetup(this.twistyPlayer)
    window.puzzle = null
  },
}
</script>

<style scoped>

</style>
