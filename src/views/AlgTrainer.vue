<template>
  <div class="algtrainer">
    <v-row class='top-bar'>
      <v-col offset='4'><scramble :scramble='item.alg' :name='item.name' :index='item.index' :moves='moves' @execMoves='executeMoves' ref='scramble' /></v-col>
      <v-col cols='1'>
        <button @click='reset'>Reset</button>
        <button @click='connect'>Connect</button>
      </v-col>
    </v-row>
    <v-row class='main-contents'>
      <v-col style='padding: 0'><div id='twisty'></div></v-col>
      <v-col cols='2' style='background-color: #eeeeee;'>
        <div class='main-timer'>{{displayTime(elapsedTime)}}</div>
        <div v-for='({time, item}, index) in timesList' :key='index'>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <div v-on="on" style='display: inline-block;'>
                {{displayTime(time)}}
              </div>
            </template>
            <b>{{item.name}}</b>: {{item.alg}}
          </v-tooltip>
        </div>
      </v-col>
    </v-row>
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

const ALG_SETS = {
  COLL_LIST: [{ name: "B1", alg: "R' U' R U' R' U2 R" }, { name: "B2", alg: "y R' U' R U' R' U R' D' R U R' D R2" }, { name: "B3", alg: "L R' U' R U L' U2 R' U2 R" }, { name: "B4", alg: "R' U' R U R' F R U R' U' R' F' R2" }, { name: "B5", alg: "R' U L U' R U L'" }, { name: "B6", alg: "R U' R' U2 R U' R' U2 R' D' R U R' D R" }, { name: "C1", alg: "R U R' U R U2 R'" }, { name: "C2", alg: "L' U2 L U2 R U' L' U L R'" }, { name: "C3", alg: "L' R U R' U' L U2 R U2 R'" }, { name: "C4", alg: "y' R U R' U R U' R D R' U' R D' R2" }, { name: "C5", alg: "R U' L' U R' U' L" }, { name: "C6", alg: "F' R U2 R' U2 R' F2 R U R U' R' F'" }, { name: "D1", alg: "y' R U2 R' U' R U R' U' R U R' U' R U' R'" }, { name: "D2", alg: "R' U2 R' D' R U2 R' D R2" }, { name: "D3", alg: "y R U2 R D R' U2 R D' R2" }, { name: "D4", alg: "x' R U' R' D R U R' D' x" }, { name: "D5", alg: "y2 F' r U R' U' r' F R" }, { name: "D6", alg: "y' R' U' R U R' F' R U R' U' R' F R2" }, { name: "E1", alg: "R' U' R U' R' U2 R2 U R' U R U2 R'" }, { name: "E2", alg: "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R" }, { name: "E3", alg: "y2 R2 D R' U2 R D' R' U2 R'" }, { name: "E4", alg: "F R U' R' U R U R' U R U' R' F'" }, { name: "E5", alg: "R2 D' R U2 R' D R U2 R" }, { name: "E6", alg: "R' U2 R F U' R' U' R U F'" }, { name: "F1", alg: "R U2 R' U' R U' R2 U2 R U R' U R" }, { name: "F2", alg: "R' U R U2 R' L' U R U' L" }, { name: "F3", alg: "y l' U' L U R U' r' F" }, { name: "F4", alg: "y2 F R U R' U' R U' R' U' R U R' F'" }, { name: "F5", alg: "y' r U R' U' r' F R F'" }, { name: "F6", alg: "R' U R2 D r' U2 r D' R2 U' R" }, { name: "G1", alg: "R U2 R2 U' R2 U' R2 U2 R" }, { name: "G2", alg: "R' F2 R U2 R U2 R' F2 U' R U' R'" }, { name: "G3", alg: "R' U' F' R U R' U' R' F R2 U2 R' U2 R" }, { name: "G4", alg: "R U R' U' R' F R2 U R' U' R U R' U' F'" }, { name: "G5", alg: "R U' L' U R' U L U L' U L" }, { name: "G6", alg: "R U D' R U R' D R2 U' R' U' R2 U2 R" }, { name: "H1", alg: "R U R' U R U' R' U R U2 R'" }, { name: "H2", alg: "F R U' R' U R U2 R' U' R U R' U' F'" }, { name: "H3", alg: "R U R' U R U L' U R' U' L" }, { name: "H4", alg: "y F R U R' U' R U R' U' R U R' U' F'" }],
  OLL_LIST: [{ name: "OLL 1", alg: "R U2 R2 F R F' U2 R' F R F'" }, { name: "OLL 2", alg: "F R U R' U' F' f R U R' U' f'" }, { name: "OLL 3", alg: "y' f R U R' U' f' U' F R U R' U' F'" }, { name: "OLL 4", alg: "y' f R U R' U' f' U F R U R' U' F'" }, { name: "OLL 5", alg: "r' U2 R U R' U r" }, { name: "OLL 6", alg: "r U2 R' U' R U' r'" }, { name: "OLL 7", alg: "r U R' U R U2 r'" }, { name: "OLL 8", alg: "y2 r' U' R U' R' U2 r" }, { name: "OLL 9", alg: "y R U R' U' R' F R2 U R' U' F'" }, { name: "OLL 10", alg: "R U R' U R' F R F' R U2 R'" }, { name: "OLL 11", alg: "r' R2 U R' U R U2 R' U M'" }, { name: "OLL 12", alg: "F R U R' U' F' U F R U R' U' F'" }, { name: "OLL 13", alg: "r U' r' U' r U r' F' U F" }, { name: "OLL 14", alg: "R' F R U R' F' R F U' F'" }, { name: "OLL 15", alg: "r' U' r R' U' R U r' U r" }, { name: "OLL 16", alg: "r U r' R U R' U' r U' r'" }, { name: "OLL 17", alg: "R U R' U R' F R F' U2 R' F R F'" }, { name: "OLL 18", alg: "r U R' U R U2 r2 U' R U' R' U2 r" }, { name: "OLL 19", alg: "M U R U R' U' M' R' F R F'" }, { name: "OLL 20", alg: "M U R U R' U' M2 U R U' r'" }, { name: "OLL 21", alg: "y R U2 R' U' R U R' U' R U' R'" }, { name: "OLL 22", alg: "R U2 R2 U' R2 U' R2 U2 R" }, { name: "OLL 23", alg: "R2 D R' U2 R D' R' U2 R'" }, { name: "OLL 24", alg: "r U R' U' r' F R F'" }, { name: "OLL 25", alg: "y F' r U R' U' r' F R" }, { name: "OLL 26", alg: "y R U2 R' U' R U' R'" }, { name: "OLL 27", alg: "R U R' U R U2 R'" }, { name: "OLL 28", alg: "r U R' U' M U R U' R'" }, { name: "OLL 29", alg: "M U R U R' U' R' F R F' M'" }, { name: "OLL 30", alg: "y2 F U R U2 R' U' R U2 R' U' F'" }, { name: "OLL 31", alg: "R' U' F U R U' R' F' R" }, { name: "OLL 32", alg: "S R U R' U' R' F R f'" }, { name: "OLL 33", alg: "R U R' U' R' F R F'" }, { name: "OLL 34", alg: "y2 R U R2 U' R' F R U R U' F'" }, { name: "OLL 35", alg: "R U2 R2 F R F' R U2 R'" }, { name: "OLL 36", alg: "y2 L' U' L U' L' U L U L F' L' F" }, { name: "OLL 37", alg: "F R U' R' U' R U R' F'" }, { name: "OLL 38", alg: "R U R' U R U' R' U' R' F R F'" }, { name: "OLL 39", alg: "y L F' L' U' L U F U' L'" }, { name: "OLL 40", alg: "y R' F R U R' U' F' U R" }, { name: "OLL 41", alg: "y2 R U R' U R U2 R' F R U R' U' F'" }, { name: "OLL 42", alg: "R' U' R U' R' U2 R F R U R' U' F'" }, { name: "OLL 43", alg: "f' L' U' L U f" }, { name: "OLL 44", alg: "f R U R' U' f'" }, { name: "OLL 45", alg: "F R U R' U' F'" }, { name: "OLL 46", alg: "R' U' R' F R F' U R" }, { name: "OLL 47", alg: "F' L' U' L U L' U' L U F" }, { name: "OLL 48", alg: "F R U R' U' R U R' U' F'" }, { name: "OLL 49", alg: "y2 r U' r2 U r2 U r2 U' r" }, { name: "OLL 50", alg: "r' U r2 U' r2 U' r2 U r'" }, { name: "OLL 51", alg: "f R U R' U' R U R' U' f'" }, { name: "OLL 52", alg: "R U R' U R d' R U' R' F'" }, { name: "OLL 53", alg: "r' U' R U' R' U R U' R' U2 r" }, { name: "OLL 54", alg: "r U R' U R U' R' U R U2 r'" }, { name: "OLL 55", alg: "R U2 R2 U' R U' R' U2 F R F'" }, { name: "OLL 56", alg: "r U r' U R U' R' U R U' R' r U' r'" }, { name: "OLL 57", alg: "R U R' U' M' U R U' r'" }],
  PLL_LIST: [{ name: "Aa", alg: "l' U R' D2 R U' R' D2 R2 x'" }, { name: "Ab", alg: "l' R' D2 R U R' D2 R U' R x'" }, { name: "E", alg: "y x' R U' R' D R U R' D' R U R' D R U' R' D' x" }, { name: "F", alg: "y R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" }, { name: "Ga", alg: "R2 u R' U R' U' R u' R2 y' R' U R" }, { name: "Gb", alg: "R' U' R y R2 u R' U R U' R u' R2" }, { name: "Gc", alg: "R2 u' R U' R U R' u R2 y R U' R'" }, { name: "Gd", alg: "R U R' y' R2 u' R U' R' U R' u R2" }, { name: "H", alg: "M2 U M2 U2 M2 U M2" }, { name: "Ja", alg: "y R' U L' U2 R U' R' U2 R L" }, { name: "Jb", alg: "R U R' F' R U R' U' R' F R2 U' R'" }, { name: "Na", alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" }, { name: "Nb", alg: "R' U R U' R' F' U' F R U R' F R' F' R U' R" }, { name: "Ra", alg: "y R U R' F' R U2 R' U2 R' F R U R U2 R'" }, { name: "Rb", alg: "R' U2 R U2 R' F R U R' U' R' F' R2" }, { name: "T", alg: "R U R' U' R' F R2 U' R' U' R U R' F'" }, { name: "Ua", alg: "y2 R U' R U R U R U' R' U' R2" }, { name: "Ub", alg: "y2 R2 U R U R' U' R' U' R' U R'" }, { name: "V", alg: "R' U R' d' R' F' R2 U' R' U R' F R F" }, { name: "Y", alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'" }, { name: "Z", alg: "M2 U M2 U M' U2 M2 U2 M'" }],
  TEST_LIST: [{name: "AA", alg: "y x R2 r L x z L' r2 U F B l' x'"}, {name: "MM", alg: "R U R' U' M' U R U' r'"}, {name: "AB", alg: "u R2 r L x z L' r2 U F B l' x'"},  {name: "AC", alg: "y x R2 x x z x2 x' x'"}, {name: "test", alg: "R y x"}, {name: "test", alg: "x y R"}, {name: "test", alg: "x y z R"},  {name: "test", alg: "y' R y'"}, {name: "test", alg: "x' R x'"}, {name: "test", alg: "z' R z'"},  {name: "test", alg: "y x R x"}, {name: "test", alg: "x R"}, {name: "test", alg: "z R"}],
}

class RandomSelector {
  constructor(length) {
    this.length = length
  }
  select () {
    return Math.floor(Math.random() * Math.floor(this.length))
  }
}

// eslint-disable-next-line
class SequentialSelector { 
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
    waitingNewAlg: true,

    algSet: [{ name: "loading", alg: "R U R' U'" }],

    timesList: [],
  }),
  methods: {
    async connect () {
      const acceptAllDevices = false
      window.puzzle = await connect({ acceptAllDevices })
      window.puzzle.addMoveListener((e) => {
        if (this.startTime === null && !this.waitingNewAlg) {
          this.startTimer()
        }
        this.moves.push(e.latestMove)
      })
    },
    reset () {
      this.puzzleState = new KPuzzle(Puzzles['3x3x3'])

      /// TODO: replace this code with barebones twisty cube (instead of full window)
      let oldTwisty = document.querySelector('#twisty').children[0]
      this.twistyPlayer = new TwistyPlayer({ alg: new Sequence([]), background: "none", controls: "none" })
      this.twistyPlayer.style = 'width: 100%; height: 100%'
      if (oldTwisty) document.querySelector('#twisty').replaceChild(this.twistyPlayer, oldTwisty)
      else document.querySelector('#twisty').appendChild(this.twistyPlayer)

      asyncSetup(this.twistyPlayer)
      window.puzzle = null

      this.selectNewAlg(this.item.index)
    },
    startTimer () {
      this.startTime = performance.now()
      this.timerID = setInterval(() => {
        this.elapsedTime = performance.now() - this.startTime
      }, 10)
    },
    stopTimer () {
      clearInterval(this.timerID)
      this.timesList.unshift({time: this.elapsedTime, item: this.item})
      this.startTime = null
      this.timerID = null
    },
    executeMoves (moves) {
      this.puzzleState.applyAlg(new Sequence(moves))
      moves.forEach(v => {
        this.twistyPlayer.experimentalAddMove(v)
      })
      // TODO: ensure that this function isn't too expensive so timing doesn't have latency.
      // TODO: Set EquivalentTransformation to only care about the required pieces. Each alg set has a different completion condition (eg. COLL permutes corners, ZBLL fully solves, OLL only orients and doesn't care about permutation, PLL doesn't care about final rotation)
      if (EquivalentTransformations(Puzzles['3x3x3'], this.puzzleState.state, new KPuzzle(Puzzles['3x3x3']).state)) {
        this.stopTimer() // TODO: ensure the timer is "stopped" at the moment the last move is made (keep track of that time) instead of the time that processing/computation is finished
        this.waitingNewAlg = true
        // TODO: add feature to remove this pause.
        setTimeout(() => {
          // Fix this so it doesn't select a new alg until cube is in solved state
          this.selectNewAlg()
        }, 1000)
      }
    },
    selectNewAlg (i) {
      this.waitingNewAlg = false
      if (i === undefined) {
        let index = this.selector.select()
        this.item = this.algSet[index]
        this.item.index = index
      }
      this.$refs.scramble.reset()
      let inverseAlg = invert(parse(this.item.alg))
      this.executeMoves(inverseAlg.nestedUnits)
      this.moves = []
    },
    // Converts from milliseconds time => mm:ss.SSS
    displayTime (time) {
      let SSS = Math.floor(time) % 1000
      let ss = Math.floor(time / 1000) % 60
      let mm = Math.floor(time / 60000)
      if (mm) return `${mm}:${ss}.${SSS}`
      return `${ss}.${SSS}`
    },
  },
  mounted () {
    this.algSet = ALG_SETS['PLL_LIST']
    this.timesList = localStorage.getItem('timesList') // TODO: add more granularity to support session names
    if (this.timesList === null) {
      this.timesList = []
    } else {
      this.timesList = JSON.parse(this.timesList)
    }

    document.addEventListener('keydown', (e) => {
      if ('urfdlbURFDLB'.split('').includes(e.key)) {
        let m = BareBlockMove(e.key.toUpperCase(), 1)
        this.moves.push(m)
        this.puzzleState.applyBlockMove(m)
      }
    })
    
    this.selector = new RandomSelector(this.algSet.length)
    this.reset()
  },
  destroyed () {
    localStorage.setItem('timesList', JSON.stringify(this.timesList))
  }
}
</script>

<style scoped>
.algtrainer {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.top-bar {
  flex: 1;
  font-size: 2em;
  background-color: rgba(93, 202, 93, 0.746);
}
.main-contents {
  flex: 20;
}
#twisty {
  height: 100%;
}
.main-timer {
  font-size: 5em;
  justify-content: center;
  text-align: center;
  font-weight: 600;
}
</style>
