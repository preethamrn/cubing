<template>
  <div class='match-data'>
    <v-container fluid>
      <v-row>
        <v-col cols='3'>
          <v-card>
            <v-card-title>Round {{matchData.length + 1}}</v-card-title>
            <v-row>
              <v-btn-toggle v-model='firstBloodTeam'>
                <v-btn v-for='teamInfo in teamSelection.teams' :key='teamInfo.team'>{{teamInfo.team}}</v-btn>
              </v-btn-toggle>
              <v-btn-toggle v-model='firstBloodPlayer' v-if='firstBloodTeam !== null'>
                <v-btn v-for='playerInfo in teamSelection.teams[firstBloodTeam].players' :key='playerInfo.name'>{{playerInfo.name}}</v-btn>
              </v-btn-toggle>
              <v-btn-toggle v-model='roundType'>
                <v-btn v-for='type in roundTypes' :key='type'>{{type}}</v-btn>
              </v-btn-toggle>
              <v-btn-toggle v-model='winningTeam'>
                <v-btn v-for='teamInfo in teamSelection.teams' :key='teamInfo.team'>{{teamInfo.team}}</v-btn>
              </v-btn-toggle>
            </v-row>
            <v-btn @click='addRow'>Submit</v-btn>
          </v-card>
        </v-col>
        <v-col cols='9'>
          <v-data-table
            :headers='headers'
            :items='matchData'
          >
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'match-data',
  data () {
    return {
      headers: [
        {name: '#', value: 'num'},
        {name: 'First Blood Team', value: 'firstBloodTeam'},
        {name: 'First Blood Player', value: 'firstBloodPlayer'},
        {name: 'Round Type', value: 'roundType'},
        {name: 'Winning Team', value: 'winningTeam'},
      ],
      matchData: [],
      
      roundTypes: ['Pistol', 'Eco', 'Anti-Eco', 'Bonus', 'Anti-Bonus', 'Gun'],

      firstBloodTeam: null,
      firstBloodPlayer: null,
      roundType: null,
      winningTeam: null,
    }
  },
  props: {
    teamSelection: Object,
  },
  methods: {
    addRow () {
      if (this.firstBloodTeam === null || this.firstBloodPlayer === null || this.roundType === null || this.winningTeam === null) return
      this.matchData.push({
        num: this.matchData.length + 1,
        firstBloodTeam: this.teamSelection.teams[this.firstBloodTeam].team,
        firstBloodPlayer: this.teamSelection.teams[this.firstBloodTeam].players[this.firstBloodPlayer].name,
        roundType: this.roundTypes[this.roundType],
        winningTeam: this.teamSelection.teams[this.winningTeam].team,
      })

      this.firstBloodTeam = null
      this.firstBloodPlayer = null
      this.roundType = null
      this.winningTeam = null
    }
  },
}
</script>

<style scoped>

</style>
