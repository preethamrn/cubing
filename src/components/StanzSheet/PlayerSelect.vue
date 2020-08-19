<template>
  <div class='player-select'>
    <v-stepper v-model='step' vertical>
      <v-stepper-step step='1'>Choose a map</v-stepper-step>
      <v-item-group v-model='map'>
        <v-container class='pa-0'>
          <v-row justify='start'>
            <v-col
              v-for='mapData in [{name: "Ascent", img: "https://liquipedia.net/commons/images/9/94/Ascent_Map_Banner.png"}, {name: "Bind", img: "https://liquipedia.net/commons/images/b/bf/Bind_Map_Banner.png"}, {name: "Haven", img: "https://liquipedia.net/commons/images/2/28/Haven_Map_Banner.png"}, {name: "Split", img: "https://liquipedia.net/commons/images/4/4c/Split_Map_Banner.png"}]'
              :key='mapData.name'
              cols='12'
              md='6'
            >
              <v-item v-slot:default='{ active, toggle }' :value='mapData.name'>
                <v-img
                  :src='mapData.img'
                  :aspect-ratio="16/9"
                  height='150'
                  class='pa-2'
                  @click='toggle(); step=2'
                >
                  <v-row align='end' class='fill-height white--text'>
                    <h1 :class='{"active": active}'>{{mapData.name}}</h1>
                  </v-row>
                </v-img>
              </v-item>
            </v-col>
          </v-row>
        </v-container>
      </v-item-group>

      <v-stepper-step step='2'>Choose the teams</v-stepper-step>
      <v-container>
        <v-text-field v-model='teams[0].team' label='Team 1' outlined></v-text-field>
        <v-text-field v-model='teams[1].team' label='Team 2' outlined></v-text-field>
      </v-container>

      <v-stepper-step step='3'>Player Selection</v-stepper-step>
      <v-container fluid>
        <v-row>
          <v-col v-for='j in [0, 1]' :key='j' cols='6'>
            <v-card>
              <v-stepper v-model='currentlySelectingPlayer[j]' vertical>
                <template v-for='i in [0, 1, 2, 3, 4]'>
                  <v-stepper-step :key='`${j}${i}-step`' :step='i+1' :complete='!!teams[j].players[i].agent' editable>
                    Player {{i+1}}{{teams[j].players[i].name ? `: ${teams[j].players[i].name}` : ''}} {{teams[j].players[i].agent ? `- ${teams[j].players[i].agent}` : ''}}
                  </v-stepper-step>
                  <v-stepper-content :key='`${j}${i}-content`' :step='i+1'>
                    <v-text-field v-model='teams[j].players[i].name' :placeholder='`Player ${i + 1}`' outlined></v-text-field>
                    <agent-select :value='teams[j].players[i].agent' @input='($event) => { teams[j].players[i].agent = $event; if ($event) {currentlySelectingPlayer[j] = i+2; $forceUpdate();} }' />
                  </v-stepper-content>
                </template>
              </v-stepper>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-stepper>
  </div>
</template>

<script>
import AgentSelect from '@/components/StanzSheet/AgentSelect'
export default {
  name: 'player-select',
  components: {
    AgentSelect,
  },
  data () {
    return {
      step: 1,
      map: 'Ascent',
      teams: [{team: '', players: [{}, {}, {}, {}, {}]}, {team: '', players: [{}, {}, {}, {}, {}]}], // list of player objects {name, agent}
      currentlySelectingPlayer: [1, 1],
    }
  },
  props: {
    value: Object,
  },
  watch: {
    step2 () {
      if (this.teams[0].team !== '' && this.teams[1].team !== '') this.step = 3
    },
    teamSelection: {
      deep: true,
      handler () {
        this.$emit('input', this.teamSelection)
      }
    }
  },
  computed: {
    step2 () {
      return this.teams[0].team + this.teams[1].team
    },
    teamSelection () {
      return {
        map: this.map,
        teams: this.teams,
      }
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 5em;
  -webkit-text-stroke: 1px black;
  color: white;
  text-shadow:
    3px 3px 0 #000,
    -1px -1px 0 #000,  
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
}

h1.active {
  -webkit-text-stroke: 1px white;
  color: black;
  text-shadow:
    3px 3px 0 #fff,
    -1px -1px 0 #fff,  
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff;
}
</style>
