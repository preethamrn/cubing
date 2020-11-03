<template>
  <div class="algtrainer">
    <v-row class='top-bar'>
      <v-col cols='1' style='padding-left: 50px'>{{(x = selector && selector.progress()) ? `${x.pos + 1}/${x.total} ${x.pos >= x.total ? 'DONE' : ''}` : ''}}</v-col>
      <v-col offset='3'><scramble :settings='settings' :scramble='item.alg' :name='item.name' :algSetName='settings.algSet' :index='item.index' :moves='moves' @execMoves='executeMoves' ref='scramble' /></v-col>
      <v-col cols='1' class='controls'>
        <settings v-model="settings" />
        <button @click='reset'>Reset</button>
        <button @click='connect'>Connect</button>
      </v-col>
    </v-row>
    <v-row class='main-contents'>
      <v-col style='padding: 0'><div id='twisty'></div></v-col>
      <v-col cols='2' style='background-color: #eeeeee;'>
        <div class='main-timer'>{{displayTime(elapsedTime)}}</div>
        <div class='times-list'>
          <!-- TODO: add more stats in the times list -->
          <div v-for='({time, item}, index) in timesList' :key='index' @click='deleteTime(index)'>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <div v-on="on" style='display: inline-block;'>
                  {{displayTime(time)}}
                </div>
              </template>
              <b>{{item.name}}</b>: {{item.alg}}
            </v-tooltip>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { invert, parse, Sequence } from "cubing/alg"
import {
  connect,
  debugKeyboardConnect,
} from "cubing/bluetooth"
import { KPuzzle, Puzzles, EquivalentTransformations } from "cubing/kpuzzle"
import { TwistyPlayer } from "cubing/twisty"
import Scramble from "../components/AlgTrainer/Scramble"
import Settings from "../components/AlgTrainer/Settings"
import {ALG_SETS} from "../components/AlgTrainer/alg_sets"
import {getFromLocalStorage} from "../utils/utils"

async function asyncSetup(twistyPlayer) {
  // TODO: remove this setup if not required
  console.log("asyncSetup")
  const keyboard = await debugKeyboardConnect(twistyPlayer) // TODO: attach to viewer only?
  console.log("keyboard", twistyPlayer, keyboard)
  keyboard.addMoveListener((e) => {
    console.log("listener", e)
    twistyPlayer.experimentalAddMove(e.latestMove)
  })
}

class RandomSelector {
  constructor(length) {
    this.length = length
  }
  select () {
    return Math.floor(Math.random() * Math.floor(this.length))
  }
  progress () {
    return null
  }
}

class SequentialSelector { 
  constructor(length, start, curr) {
    this.length = length
    this.start = start || Math.floor(Math.random() * Math.floor(this.length))
    this.curr = curr ? curr - 1 : this.start // When curr is already set, we need to go back one alg because curr is auto-incremented in select() so on page refresh we will actually be one alg ahead even if we didn't actually do the alg.
  }
  select () {
    let ret = this.curr % this.length
    this.curr++
    return ret
  }
  progress () {
    return { pos: this.curr - this.start - 1, total: this.length } // Offset curr by 1 because it is auto-incremented
  }
}
// TODO: fix bug with executeMoves when the cube should be solved but the last move is incorrect (this will probably require a fix in Scramble to support incorrect moves even after processedScramble is exhausted)
// TODO: custom orientation

// TODO: support rotation/orientation agnostic EquivalentTransformations for solved states

export default {
  name: "algtrainer",
  components: {
    Scramble,
    Settings,
  },
  data: () => ({
    twistyPlayer: null, // TODO: display just the cube and not the entire player window
    item: {name: "invalid", alg: ""},
    moves: [],
    puzzleState: null,
    selector: null,

    timerID: null,
    startTime: null, cubeStartTime: null,
    elapsedTime: null,
    waitingNewAlg: true,
    onMoveCallback: null,

    settings: {},
    algSet: [{ name: "loading", alg: "R U R' U'" }],

    timesList: [],
  }),
  methods: {
    async connect () {
      const acceptAllDevices = false
      window.puzzle = await connect({ acceptAllDevices })
      window.puzzle.addMoveListener((e) => {
        // console.log('receiving: ', e.latestMove)
        if (this.waitingNewAlg) {
          this.executeMoves([e]) // Always keep puzzle state equivalent to cube state
          if (this.onMoveCallback) this.onMoveCallback() // TODO: also add a message stating that the cube is unsolved and must be fixed to proceed
          return
        }
        if (this.startTime === null) {
          this.startTimer(e)
        }
        // TODO: when pushing move, set cube "timeStamp" to processor.now().
        this.moves.push(e)
      })
    },
    deleteTime (index) {
      this.timesList = this.timesList.slice(0, index).concat(this.timesList.slice(index+1))
    },
    reset () {
      if (this.selector === null) return // On page load don't reset until the selector is created. This is done in the settings watcher which automatically triggers reset.

      this.puzzleState = new KPuzzle(Puzzles['3x3x3'])

      // Set up twisty player
      let oldTwisty = document.querySelector('#twisty').children[0]
      this.twistyPlayer = new TwistyPlayer({ alg: new Sequence([]), background: "none", controls: "none" })
      this.twistyPlayer.style = 'width: 100%; height: 100%'
      if (oldTwisty) document.querySelector('#twisty').replaceChild(this.twistyPlayer, oldTwisty)
      else document.querySelector('#twisty').appendChild(this.twistyPlayer)

      asyncSetup(this.twistyPlayer)
      window.puzzle = null

      this.selectNewAlg(this.item.index)
      // stop timer when reset
      clearInterval(this.timerID)
      this.startTime = null
      this.timerID = null
    },
    startTimer (e) {
      this.startTime = performance.now()
      this.cubeStartTime = e.timeStamp
      this.timerID = setInterval(() => {
        this.elapsedTime = performance.now() - this.startTime
      }, 10)
    },
    stopTimer (e) {
      clearInterval(this.timerID)
      if (this.settings.timer === 'cube' && e.timeStamp && this.cubeStartTime) this.elapsedTime = (e.timeStamp - this.cubeStartTime)
      // TODO: add more information like algSet, date/time to this.
      this.timesList.unshift({time: this.elapsedTime, item: this.item})
      this.startTime = null
      this.timerID = null
    },
    executeMoves (moves) {
      // TODO: (IMPORTANT NOTE) this function will fail if somehow we pass in 2 correct moves and 1 incorrect move to the Scramble component. The incorrect move fails to get a mapping and then the function returns an error and everything breaks.
      let blockMoves = moves.map(v => v.latestMove)
      this.puzzleState.applyAlg(new Sequence(blockMoves))
      blockMoves.forEach(v => {
        this.twistyPlayer.experimentalAddMove(v)
      })
      // TODO: Set EquivalentTransformation to only care about the required pieces. Each alg set has a different completion condition (eg. COLL permutes corners, ZBLL fully solves, OLL only orients and doesn't care about permutation, PLL doesn't care about final rotation)
      if (EquivalentTransformations(Puzzles['3x3x3'], this.puzzleState.state, new KPuzzle(Puzzles['3x3x3']).state)) {
        if (this.waitingNewAlg) {
          this.selectNewAlg()
        } else {
          this.stopTimer(moves[moves.length - 1]) // Ensure the timer is "stopped" at the moment the last move is made (keep track of that time) instead of the time that processing/computation is finished
          this.waitingNewAlg = true
          setTimeout(() => {
            // If cube isn't in a solved state, require the cube to be solved before proceeding
            // This is handled by code in the onMove handler that executes a new move each time it arrives and checks whether the cube is solved from above.
            if (EquivalentTransformations(Puzzles['3x3x3'], this.puzzleState.state, new KPuzzle(Puzzles['3x3x3']).state)) {
              this.selectNewAlg()
            }
          }, this.settings.waitTime)
        }
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
      this.executeMoves(inverseAlg.nestedUnits.map(v => ({latestMove: v})))
      this.moves = []
    },
    // Converts from milliseconds time => mm:ss.SSS
    displayTime (time) {
      let SSS = (Math.floor(time) % 1000).toString().padStart(3, '0')
      let ss = Math.floor(time / 1000) % 60
      let mm = Math.floor(time / 60000)
      if (mm) return `${mm}:${ss.toString().padStart(2, '0')}.${SSS}`
      return `${ss}.${SSS}`
    },
  },
  watch: {
    settings (newSettings, oldSettings) {
      if (newSettings.algSet === oldSettings.algSet && newSettings.selector === oldSettings.selector) return
      
      if (oldSettings.selector === 'sequential') {
        let confirmation = confirm('This will reset your progress in the alg set. Continue?')
        if (!confirmation) {
          this.settings.selector = oldSettings.selector
          this.settings.algSet = oldSettings.algSet
          return
        }
      }

      this.algSet = ALG_SETS[this.settings.algSet]
      // load custom algs
      let customAlgs = localStorage.getItem(`customAlgs.${this.settings.algSet}`)
      if (customAlgs) {
        customAlgs = JSON.parse(customAlgs)
        this.algSet.forEach((v, i) => {
          if (customAlgs[v.name] !== undefined) {
            this.algSet[i].alg = customAlgs[v.name]
          }
        })
      }

      switch(this.settings.selector) {
        case 'random': {
          this.selector = new RandomSelector(this.algSet.length)
          break
        }
        case 'sequential': {
          let sequentialSelectorState = localStorage.getItem('sequentialSelectorState')
          if (sequentialSelectorState) {
            let v = JSON.parse(sequentialSelectorState)
            this.selector = new SequentialSelector(v.length, v.start, v.curr)
            localStorage.removeItem('sequentialSelectorState')
          } else {
            this.selector = new SequentialSelector(this.algSet.length)
          }
          break
        }
      }
      this.item = {}
      this.reset()
    }
  },
  created () {
    this.ALG_SETS = ALG_SETS
    this.timesList = getFromLocalStorage('timesList', []) // TODO: add more granularity to support session names
  },
  mounted () {
    // document.addEventListener('keydown', (e) => {
    //   if ('urfdlbURFDLB'.split('').includes(e.key)) {
    //     let m = BareBlockMove(e.key.toUpperCase(), 1)
    //     this.moves.push({latestMove: m})
    //     this.puzzleState.applyBlockMove(m)
    //   }
    // })
    this.reset()
    window.onbeforeunload = () => {
      localStorage.setItem('timesList', JSON.stringify(this.timesList))
      localStorage.setItem('algTrainerSettings', JSON.stringify(this.settings))
      if (this.selector instanceof SequentialSelector) localStorage.setItem('sequentialSelectorState', JSON.stringify(this.selector))
      else localStorage.removeItem('sequentialSelectorState')
    }
  },
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
  background-color: rgb(39, 39, 39);
  color: white;
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
.times-list {
  max-height: 75vh;
  overflow-y: scroll;
}
</style>
