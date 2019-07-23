<template>
  <div class="bldtrainer3">
    <v-container>
      <h1 style='padding: 20px 0 20px 0'>3BLD Trainer</h1>
      <v-switch v-model='testCorners' :label='testCorners ? "Corners" : "Edges"' color='success' @change='next'></v-switch>
      <v-layout row wrap>
        <v-flex xs12 md5>
          <v-layout row>
            <div :style='{background: stickerBG[0]}' class='sticker-box'></div>
            <div :style='{background: stickerBG[1]}' class='sticker-box'></div>
          </v-layout>
          <v-layout row>
            <div :style='{display: testCorners ? "inline" : "none", background: stickerBG[2]}' class='sticker-box'></div>
            <input class='mobile-input' ref='mobile-input' placeholder="click me" @input='mobileInputUpdate'/>
          </v-layout>
          <v-layout v-if='correctAnswer !== ""' column>
            <div v-if='correctAnswer === selectedAnswer'><h1 style='color: green'>Correct!</h1></div>
            <div v-else>
              <h1 style='color: red'>Incorrect</h1>
              <h1>You chose: {{selectedAnswer}}, Correct Answer: {{correctAnswer}} </h1>
            </div>
            <div><h1>Time taken: {{formatTime(timeTaken)}}</h1></div>
            <div><h1>Avg: {{formatTime(average(correctTimes))}}</h1></div>
            <div><h1>Std. Dev.: {{formatTime(standardDeviation(correctTimes))}}</h1></div>
          </v-layout>
        </v-flex>
        <v-flex xs12 md7>
          <v-layout row :class="{'mt-5': $vuetify.breakpoint.smAndDown, 'ma-0': $vuetify.breakpoint.mdAndUp}">
            <v-data-table hide-actions :headers='[{text: "#", sortable: false}, {text: "Time", sortable: false}, {text: "Delete?", sortable: false}]' :items='times' class='elevation-1'>
              <template v-slot:items='props'>
                <tr :key='props.index' :class="{'correct-answer': props.item.correct, 'incorrect-answer': !props.item.correct}">
                  <td>{{ times.length - props.index }}</td>
                  <td class='text-xs-right'>{{ formatTime(props.item.time) }}</td>
                  <td class='text-xs-right' @click='deleteTime(props.index)()'>x</td>
                </tr>
              </template>
            </v-data-table>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

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
    times: [],

    debouncer: false, // prevent multiple keypressed or keypressed during interval from checking
  }),
  methods: {
    next () {
      this.debouncer = false
      
      let keys = Object.keys(this.testCorners ? this.corners : this.edges)
      
      // don't allow same selection twice in a row because this looks like UI is lagging
      let oldSelection = this.selection
      while (oldSelection === this.selection) { 
        this.selection = keys[Math.floor(Math.random() * keys.length)]
      }

      // convert selection into configured sticker colors
      for (let i=0; i<this.selection.length; i++) {
        this.stickerBG[i] = this.colors[this.selection[i]]
      }
      this.$forceUpdate()
      this.realTimeStart = window.performance.now()
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
    mobileInputUpdate (event) {
      this.$refs['mobile-input'].value = ''
      this.eventHandler({type: 'keydown', key: event.data})
    },

    formatTime (time) {
      let date = new Date(time)
      if (time < 60000) return date.getSeconds() + '.' + date.getMilliseconds().pad(3) + 's'
      else if (time < 3600000) return date.getMinutes() + ':' + date.getSeconds().pad(2) + '.' + date.getMilliseconds().pad(3)
      else if (time < 86400000) return date.getHours() + ':' + date.getMinutes().pad(2) + ':' + date.getSeconds().pad(2) + '.' + date.getMilliseconds().pad(3)
      else return 'dude. that way seriously way too long I lost track of time'
    },

    deleteTime (i) {
      let self = this
      return function () {
        self.times.splice(i, 1)
        localStorage.setItem('3BLD-trainer-times', JSON.stringify(self.times))
      }
    },

    // stats
    standardDeviation (values){
      var avg = this.average(values);
      var squareDiffs = values.map(function (value){
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
      });
      var avgSquareDiff = this.average(squareDiffs);
      var stdDev = Math.sqrt(avgSquareDiff);
      return stdDev;
    },
    average (data){
      var sum = data.reduce(function (sum, value){
        return sum + value;
      }, 0);
      var avg = sum / data.length;
      return avg;
    }
  },
  mounted: function () {
    let times = JSON.parse(localStorage.getItem('3BLD-trainer-times'))
    if (times) {
      this.times = times
    }
    this.next()
    document.addEventListener('keydown', this.eventHandler)
  },
  watch: {
    timeTaken () {
      this.times.unshift({
        time: this.timeTaken,
        correct: this.correctAnswer === this.selectedAnswer,
        selection: this.selection,
        selectedAnswer: this.selectedAnswer,
        correctAnswer: this.correctAnswer,
      })
      localStorage.setItem('3BLD-trainer-times', JSON.stringify(this.times))
    }
  },
  computed: {
    correctTimes () {
      return this.times.filter(time => time.correct).map(time => time.time)
    }
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
  height: 100%;
  min-height: 100vh;
}

.correct-answer {
  background: #7CFC00;
}
.incorrect-answer {
  background: #F08080;
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
