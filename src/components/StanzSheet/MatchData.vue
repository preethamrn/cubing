<template>
  <div class='match-data'>
    <v-container fluid>
      <v-row>
        <v-col cols='4' offset='1'>
          <v-card>
            <youtube v-if='vodType === "youtube"' :videoId='vodID' ref='youtubePlayer' class='video-player'></youtube>
            <vue-twitch-player v-if='vodType === "twitch"' width='640' height='360' :video='vodID' ref='twitchPlayer' class='video-player'></vue-twitch-player>
            <div v-if='currentRound !== -1'>
              <v-card-title>Round {{currentRound + 1}}</v-card-title>
              <v-card-text>
                <h2>First Blood</h2>
                <v-row class='pl-4'>
                  <v-btn-toggle v-model='firstBloodTeam'>
                    <v-btn v-for='teamInfo in teamSelection.teams' :key='teamInfo.team'>{{teamInfo.team}}</v-btn>
                  </v-btn-toggle>
                </v-row>
                <v-row class='pl-4'>
                  <v-btn-toggle v-model='firstBloodPlayer' v-if='firstBloodTeam !== null'>
                    <v-btn v-for='playerInfo in teamSelection.teams[firstBloodTeam].players' :key='playerInfo.name'>{{playerInfo.name}}</v-btn>
                  </v-btn-toggle>
                </v-row>
                <h2>Round Type</h2>
                <v-row class='pl-4'>
                  <v-btn-toggle v-model='roundType'>
                    <v-btn v-for='type in roundTypes' :key='type'>{{type}}</v-btn>
                  </v-btn-toggle>
                </v-row>
                <h2>Spike Planted</h2>
                <v-row class='pl-4'>
                  <v-btn-toggle v-model='planted'>
                    <v-btn v-for='type in plantedTypes' :key='type'>{{type}}</v-btn>
                  </v-btn-toggle>
                </v-row>
                <h2>Round Winner</h2>
                <v-row class='pb-4 pl-4'>
                  <v-btn-toggle v-model='winningTeam'>
                    <v-btn v-for='teamInfo in teamSelection.teams' :key='teamInfo.team'>{{teamInfo.team}}</v-btn>
                  </v-btn-toggle>
                </v-row>
                <v-btn @click='addRow'>Submit</v-btn>
              </v-card-text>
            </div>
            <div v-else>
              <v-card-text>
                <p>Set the VOD time to the start of the first round and then press START.</p>
                <v-btn @click='currentRound = 0; roundStartTime = currentVodTime()'><b>START</b></v-btn>
              </v-card-text>
            </div>
          </v-card>
        </v-col>
        <v-col cols='6'>
          <v-card flat>
            <v-card-title>
              Data table
              <v-btn text @click='copyClipboard'>
                <v-tooltip top>
                  <template  v-slot:activator='{on}'>
                    <v-icon v-on='on'>far fa-copy</v-icon>
                  </template>
                  <span>Copy to clipboard</span>
                </v-tooltip>
              </v-btn>
              <v-btn text @click='clearAutoSave'>
                <v-tooltip top>
                  <template  v-slot:activator='{on}'>
                    <v-icon v-on='on'>far fa-trash-alt</v-icon>
                  </template>
                  <span>Delete auto-save</span>
                </v-tooltip>
              </v-btn>
            </v-card-title>
            <v-data-table
              :headers='headers'
              :items='matchData'
              :items-per-page='Infinity'
              @click:row='editRow'
              dense
              hide-default-footer
            >
              <template v-slot:item.vodTime='{item}'>
                <a :href='vodURL(item.vodTime)' target='_blank'>{{Math.floor(item.vodTime)}}</a>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import VueTwitchPlayer from 'vue-twitch-player'

export default {
  name: 'match-data',
  components: {
    VueTwitchPlayer,
  },
  data () {
    return {
      headers: [
        {text: '#', value: 'num'},
        {text: 'First Blood Team', value: 'firstBloodTeam'},
        {text: 'First Blood Player', value: 'firstBloodPlayer'},
        {text: 'Round Type', value: 'roundType'},
        {text: 'Winning Team', value: 'winningTeam'},
        {text: 'Planted Spike', value: 'planted'},
        {text: 'VOD', value: 'vodTime'}
      ],
      matchData: [],
      
      roundTypes: ['Pistol', 'Eco', 'Anti-Eco', 'Bonus', 'Anti-Bonus', 'Gun'],
      plantedTypes: ['Y', 'N'],

      currentRound: -1,
      roundStartTime: '',
      firstBloodTeam: null,
      firstBloodPlayer: null,
      roundType: null,
      planted: 1,
      winningTeam: null,
    }
  },
  props: {
    teamSelection: Object,
    vodType: String,
    vodID: String,
  },
  methods: {
    vodURL (time) {
      return this.vodType === 'youtube' ? `https://youtu.be/${this.vodID}?t=${Math.floor(time)}` : (this.vodType === 'twitch' ? `https://www.twitch.tv/videos/${this.vodID}?t=${Math.floor(time)}s` : '')
    },
    currentVodTime () {
      return this.vodType === 'youtube' ? this.$refs.youtubePlayer.player.getCurrentTime() : (this.vodType === 'twitch' ? this.$refs.twitchPlayer.getCurrentTime() : 0)
    },
    copyClipboard () {
      let text = this.teamSelection.map + '\n'
      for (let i in this.matchData) {
        for (let j in this.headers) {
          if (this.headers[j].value === 'vodTime') text += this.vodURL(this.matchData[i][this.headers[j].value]) + '\t'
          else text += this.matchData[i][this.headers[j].value] + '\t'
        }
        text += '\n'
      }

      navigator.clipboard.writeText(text)
    },
    clearAutoSave () {
      localStorage.removeItem('stanz-sheet-match-data')
    },
    editRow (item) {
      this.firstBloodTeam = this.teamSelection.teams.findIndex(v => v.team === item.firstBloodTeam)
      this.firstBloodPlayer = this.teamSelection.teams[this.firstBloodTeam].players.findIndex(v => v.name === item.firstBloodPlayer)
      this.roundType = this.roundTypes.indexOf(item.roundType)
      this.planted = this.plantedTypes.indexOf(item.planted)
      this.winningTeam = this.teamSelection.teams.findIndex(v => v.team === item.winningTeam)
      this.currentRound = item.num - 1
      this.roundStartTime = item.vodTime
    },
    addRow () {
      if (this.firstBloodTeam === null || this.firstBloodPlayer === null || this.roundType === null || this.winningTeam === null) return
      let item = {
        num: this.currentRound + 1,
        firstBloodTeam: this.teamSelection.teams[this.firstBloodTeam].team,
        firstBloodPlayer: this.teamSelection.teams[this.firstBloodTeam].players[this.firstBloodPlayer].name,
        roundType: this.roundTypes[this.roundType],
        planted: this.plantedTypes[this.planted],
        winningTeam: this.teamSelection.teams[this.winningTeam].team,
        vodTime: this.roundStartTime,
      }
      if (this.currentRound >= this.matchData.length) {
        this.matchData.push(item)
      } else {
        this.$set(this.matchData, this.currentRound, item)
      }

      this.firstBloodTeam = null
      this.firstBloodPlayer = null
      this.roundType = null
      this.planted = 1
      this.winningTeam = null
      this.currentRound = this.matchData.length
      this.roundStartTime = this.currentVodTime()

      localStorage.setItem('stanz-sheet-match-data', JSON.stringify({
        currentRound: this.currentRound,
        roundStartTime: this.roundStartTime,
        matchData: this.matchData,
        teamSelection: this.teamSelection,
      }))
    }
  },
  created () {
    let data = localStorage.getItem('stanz-sheet-match-data')
    if (data !== null) {
      data = JSON.parse(data)
      this.matchData = data.matchData
      this.currentRound = data.currentRound
      this.roundStartTime = data.roundStartTime
    }
  }
}
</script>

<style scoped>
.video-player {
  width: fit-content;
  margin: auto;
}
</style>
