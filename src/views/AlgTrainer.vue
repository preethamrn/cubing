<template>
  <div class="algtrainer">
    <button @click='connect'>Connect</button>
    <scramble :scramble='scramble' :moves='moves' />
    <div id='twisty'></div>
    <div>{{elapsedTime}}</div>
  </div>
</template>

<script>
import { invert, parse, Sequence, BareBlockMove } from "cubing/alg"
import {
  connect,
  debugKeyboardConnect,
} from "cubing/bluetooth"
import { KPuzzle, Puzzles, EquivalentTransformations } from "cubing/kpuzzle"
import { TwistyPlayer } from "cubing/twisty"
import Scramble from "../components/AlgTrainer/Scramble"
import { clearInterval, setInterval, setTimeout } from 'timers';

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

    timerID: null,
    startTime: null,
    elapsedTime: null,
  }),
  methods: {
    async connect () {
      const acceptAllDevices = false
      window.puzzle = await connect({ acceptAllDevices })
      window.puzzle.addMoveListener((e) => {
        if (this.startTime === null) {
          this.startTimer()
        }
        this.twistyPlayer.experimentalAddMove(e.latestMove)
        this.moves.push(e.latestMove)
        this.puzzleState.applyBlockMove(e.latestMove)
        // TODO: ensure that this function isn't too expensive so timing doesn't have latency.
        if (EquivalentTransformations(Puzzles['3x3x3'], this.puzzleState.state, new KPuzzle(Puzzles['3x3x3']).state)) {
          this.stopTimer()
          // TODO: add feature to remove this pause.
          setTimeout(() => {
            this.selectNewAlg()
            this.moves = []
          }, 1000)
        }
      })
      // window.puzzle.addOrientationListener(() => {
      //   // TODO
      // })
    },
    startTimer () {
      this.startTime = performance.now()
      this.timerID = setInterval(() => {
        this.elapsedTime = performance.now() - this.startTime
      }, 10)
    },
    stopTimer () {
      clearInterval(this.timerID)
      this.startTime = null
      this.timerID = null
    },
    selectNewAlg () {
      this.scramble = "R U2 R' U2 R' U' R U R U' R' U2 R' U2 R"
      let inverseAlg = invert(parse(this.scramble))
      this.puzzleState.applyAlg(inverseAlg)
      inverseAlg.nestedUnits.forEach(v => {
        this.twistyPlayer.experimentalAddMove(v)
      })
    }
  },
  mounted () {
    // TODO: remove this testing code.
    document.addEventListener('keydown', (e) => {
      if ('urfdlbURFDLB'.split('').includes(e.key)) {
        let m = BareBlockMove(e.key.toUpperCase(), 1)
        this.moves.push(m)
        this.puzzleState.applyBlockMove(m)
      }
    })
    this.puzzleState = new KPuzzle(Puzzles['3x3x3'])
    
    /// TODO: replace this code with barebones twisty cube (instead of full window)
    this.twistyPlayer = new TwistyPlayer({ alg: new Sequence([]) })
    document.querySelector('#twisty').appendChild(this.twistyPlayer)
    asyncSetup(this.twistyPlayer)
    window.puzzle = null
    
    this.selectNewAlg()
  },
}
</script>

<style scoped>

</style>
