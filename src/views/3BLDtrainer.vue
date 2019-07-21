<template>
  <div class="bldtrainer3">
    <v-container>
      <h1 style='padding: 20px 0 20px 0'>3BLD Trainer</h1>
      <v-switch v-model='testCorners' label='Train Corners' color='success' @change='next'></v-switch>
      <v-layout row>
        <div :style='{background: stickerBG[0]}' class='sticker-box'></div>
        <div :style='{background: stickerBG[1]}' class='sticker-box'></div>
      </v-layout>
      <v-layout row>
        <div :style='{display: testCorners ? "inline" : "none", background: stickerBG[2]}' class='sticker-box'></div>
        <input class='mobile-input' placeholder="click me" />
      </v-layout>
      <v-layout v-if='correctAnswer !== ""' column>
        <div v-if='correctAnswer === selectedAnswer'><h1 style='color: green'>Correct!</h1></div>
        <div v-else>
          <h1 style='color: red'>Incorrect</h1>
          <h1>You chose: {{selectedAnswer}}, Correct Answer: {{correctAnswer}} </h1>
        </div>
        <div><h1>Time taken: {{formatTime(timeTaken)}}</h1></div>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'BLDTrainer3',
  data: () => ({
    colors: {
      'U': 'white',
      'L': 'orange',
      'F': 'green',
      'R': 'red',
      'B': 'blue',
      'D': 'yellow'
    },
    corners: {
      'UBL': 'A',
      'URB': 'B',
      'UFR': 'C',
      'ULF': 'D',
      'LUB': 'E',
      'LFU': 'F',
      'LDF': 'G',
      'LBD': 'H',
      'FUL': 'I',
      'FRU': 'J',
      'FDR': 'K',
      'FLD': 'L',
      'RUF': 'M',
      'RBU': 'N',
      'RDB': 'O',
      'RFD': 'P',
      'BUR': 'Q',
      'BLU': 'R',
      'BDL': 'S',
      'BRD': 'T',
      'DFL': 'U',
      'DRF': 'V',
      'DBR': 'W',
      'DLB': 'X'
    },
    edges: {
      'UB': 'A',
      'UR': 'B', 
      'UF': 'C', 
      'UL': 'D', 
      'LU': 'E', 
      'LF': 'F', 
      'LD': 'G', 
      'LB': 'H', 
      'FU': 'I', 
      'FR': 'J', 
      'FD': 'K', 
      'FL': 'L', 
      'RU': 'M', 
      'RB': 'N', 
      'RD': 'O', 
      'RF': 'P', 
      'BU': 'Q', 
      'BL': 'R', 
      'BD': 'S', 
      'BR': 'T', 
      'DF': 'U', 
      'DR': 'V', 
      'DB': 'W', 
      'DL': 'X'
    },
    testCorners: true,

    selection: '',
    stickerBG: ['red', 'blue', 'white'],

    correctAnswer: '',
    selectedAnswer: '',
    realTimeStart: 0,
    timeTaken: 0,

    debouncer: false, // prevent multiple keypressed or keypressed during interval from checking
  }),
  methods: {
    next () {
      this.debouncer = false
      this.realTimeStart = window.performance.now()

      if (this.testCorners) {
        let keys = Object.keys(this.corners)
        this.selection = keys[Math.floor(Math.random() * keys.length)]
      } else {
        let keys = Object.keys(this.edges)
        this.selection = keys[Math.floor(Math.random() * keys.length)]
      }
      for (let i=0; i<this.selection.length; i++) {
        this.stickerBG[i] = this.colors[this.selection[i]]
      }
      this.$forceUpdate()
    },
    checkKey (key) {
      this.correctAnswer = (this.testCorners ? this.corners : this.edges)[this.selection].toUpperCase()
      this.selectedAnswer = key.toUpperCase()
      this.timeTaken = window.performance.now() - this.realTimeStart
      return this.selectedAnswer === this.correctAnswer
    },

    eventHandler (event) {
      if (this.debouncer || event.type !== 'keydown' || event.key.length > 1) return
      this.debouncer = true
      this.checkKey(event.key)
      setTimeout(this.next, 1000)
    },

    formatTime (time) {
      let date = new Date(time)
      if (time < 60000) return date.getSeconds() + '.' + date.getMilliseconds() + 's'
      else if (time < 3600000) return date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds()
      else if (time < 86400000) return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds()
      else return 'dude. that way seriously way too long I lost track of time'
    }
  },
  mounted: function () {
    this.next()
    document.addEventListener('keydown', this.eventHandler)
  }
}
</script>

<style scoped>
.sticker-box {
  height: 100px !important;
  width: 100px !important;
  margin: 5px;
  background: white;
  border: thick solid black;
}
.bldtrainer3 {
  background: #eeeeee;
  height: 100vh;
}
.mobile-input {
  display: none;
}
@media only screen and (max-width: 1000px) {
  .mobile-input {
    display: inline;
  }
}
</style>
