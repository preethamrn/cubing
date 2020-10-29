<template>
  <div class="algtrainer">
    <button @click='connect'>Connect</button>
    <scramble :scramble='item.alg' :moves='moves' />
    <div id='twisty'></div>
    <div>{{elapsedTime}}</div>
    <div>{{item}}</div>
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

const COLL_LIST = [{ name: "B1", alg: "R' U' R U' R' U2 R" }, { name: "B2", alg: "y R' U' R U' R' U R' D' R U R' D R2" }, { name: "B3", alg: "L R' U' R U L' U2 R' U2 R" }, { name: "B4", alg: "R' U' R U R' F R U R' U' R' F' R2" }, { name: "B5", alg: "R' U L U' R U L'" }, { name: "B6", alg: "R U' R' U2 R U' R' U2 R' D' R U R' D R" }, { name: "C1", alg: "R U R' U R U2 R'" }, { name: "C2", alg: "L' U2 L U2 R U' L' U L R'" }, { name: "C3", alg: "L' R U R' U' L U2 R U2 R'" }, { name: "C4", alg: "y' R U R' U R U' R D R' U' R D' R2" }, { name: "C5", alg: "R U' L' U R' U' L" }, { name: "C6", alg: "F' R U2 R' U2 R' F2 R U R U' R' F'" }, { name: "D1", alg: "y' R U2 R' U' R U R' U' R U R' U' R U' R'" }, { name: "D2", alg: "R' U2 R' D' R U2 R' D R2" }, { name: "D3", alg: "y R U2 R D R' U2 R D' R2" }, { name: "D4", alg: "x' R U' R' D R U R' D' x" }, { name: "D5", alg: "y2 F' r U R' U' r' F R" }, { name: "D6", alg: "y' R' U' R U R' F' R U R' U' R' F R2" }, { name: "E1", alg: "R' U' R U' R' U2 R2 U R' U R U2 R'" }, { name: "E2", alg: "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R" }, { name: "E3", alg: "y2 R2 D R' U2 R D' R' U2 R'" }, { name: "E4", alg: "F R U' R' U R U R' U R U' R' F'" }, { name: "E5", alg: "R2 D' R U2 R' D R U2 R" }, { name: "E6", alg: "R' U2 R F U' R' U' R U F'" }, { name: "F1", alg: "R U2 R' U' R U' R2 U2 R U R' U R" }, { name: "F2", alg: "R' U R U2 R' L' U R U' L" }, { name: "F3", alg: "y l' U' L U R U' r' F" }, { name: "F4", alg: "y2 F R U R' U' R U' R' U' R U R' F'" }, { name: "F5", alg: "y' r U R' U' r' F R F'" }, { name: "F6", alg: "R' U R2 D r' U2 r D' R2 U' R" }, { name: "G1", alg: "R U2 R2 U' R2 U' R2 U2 R" }, { name: "G2", alg: "R' F2 R U2 R U2 R' F2 U' R U' R'" }, { name: "G3", alg: "R' U' F' R U R' U' R' F R2 U2 R' U2 R" }, { name: "G4", alg: "R U R' U' R' F R2 U R' U' R U R' U' F'" }, { name: "G5", alg: "R U' L' U R' U L U L' U L" }, { name: "G6", alg: "R U D' R U R' D R2 U' R' U' R2 U2 R" }, { name: "H1", alg: "R U R' U R U' R' U R U2 R'" }, { name: "H2", alg: "F R U' R' U R U2 R' U' R U R' U' F'" }, { name: "H3", alg: "R U R' U R U L' U R' U' L" }, { name: "H4", alg: "y F R U R' U' R U R' U' R U R' U' F'" }]

class RandomSelector {
  constructor(length) {
    this.length = length
  }
  select () {
    return Math.floor(Math.random() * Math.floor(this.length))
  }
}

class SequentialSelector { // eslint-disable-line
  constructor(length) {
    this.length = length
    this.start = Math.floor(Math.random() * Math.floor(this.length))
    this.curr = this.start
  }
  select () {
    let ret = this.curr
    this.curr = (this.curr + 1) % this.length
    return ret
  }
}

export default {
  name: "algtrainer",
  components: {
    Scramble,
  },
  data: () => ({
    twistyPlayer: null, // TODO: display just the cube and not the entire player window
    item: {name: "invalid", alg: ""},
    moves: [],
    puzzleState: null,
    selector: null,

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
      this.item = COLL_LIST[this.selector.select()]
      let inverseAlg = invert(parse(this.item.alg))
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
    
    this.selector = new RandomSelector(COLL_LIST.length)
    this.selectNewAlg()
  },
}
</script>

<style scoped>

</style>
