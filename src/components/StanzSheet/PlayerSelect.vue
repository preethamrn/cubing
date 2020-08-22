<template>
  <div class='player-select'>
    <v-container fluid>
    <v-row>
      <v-col cols='5'>
        <h2>Map</h2>
        <v-item-group v-model='map'>
          <v-container class='pa-2'>
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
                    @click='toggle'
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

        <h2>Teams</h2>
        <v-container>
          <v-text-field v-model='teams[0].team' label='Team 1' outlined></v-text-field>
          <v-text-field v-model='teams[1].team' label='Team 2' outlined></v-text-field>
        </v-container>

        <h2>VOD URL</h2>
        <v-container>
          <v-text-field v-model='vodURL' label='URL (optional)' outlined></v-text-field>
        </v-container>
      </v-col>
      <v-col cols='7'>
        <h2>Player Selection</h2>
        <v-container fluid>
          <v-row>
            <v-col v-for='j in [0, 1]' :key='j' cols='6'>
              <h3>{{teams[j].team}}</h3>
              <v-card>
                <v-stepper v-model='currentlySelectingPlayer[j]' vertical>
                  <template v-for='i in [0, 1, 2, 3, 4]'>
                    <v-stepper-step :key='`${j}${i}-step`' :step='i+1' :complete='!!teams[j].players[i].agent' editable>
                      Player {{i+1}}{{teams[j].players[i].name ? `: ${teams[j].players[i].name}` : ''}} {{teams[j].players[i].agent ? `- ${teams[j].players[i].agent}` : ''}}
                    </v-stepper-step>
                    <v-stepper-content :key='`${j}${i}-content`' :step='i+1'>
                      <v-text-field v-model='teams[j].players[i].name' :placeholder='`Player ${i + 1}`' :ref='`playerInput-${i},${j}`' outlined></v-text-field>
                      <agent-select :value='teams[j].players[i].agent' @input='($event) => { 
                        teams[j].players[i].agent = $event
                        if ($event) {
                          currentlySelectingPlayer[j] = i+2
                          if (i < 4) $refs[`playerInput-${i+1},${j}`][0].focus()
                          $forceUpdate()
                        }
                      }' />
                    </v-stepper-content>
                  </template>
                </v-stepper>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
    </v-container>
  </div>
</template>

<script>
import AgentSelect from '@/components/StanzSheet/AgentSelect'

const _stanzSheetTeamDefaults = 'stanz-sheet-team-defaults'

export default {
  name: 'player-select',
  components: {
    AgentSelect,
  },
  data () {
    return {
      map: 'Ascent',
      vodURL: '',
      teams: [{team: '', players: [{}, {}, {}, {}, {}]}, {team: '', players: [{}, {}, {}, {}, {}]}], // list of player objects {name, agent}
      currentlySelectingPlayer: [1, 1],

      defaultPlayersList: {},
    }
  },
  props: {
    value: Object,
  },
  watch: {
    teamSelection: {
      deep: true,
      handler () {
        // Check if default exists and players haven't yet been set
        if (this.defaultPlayersList[this.teams[0].team] && !this.teams[0].players[0].name) {
          this.teams[0].players = this.defaultPlayersList[this.teams[0].team].map(v => ({name: v}))
        }
        if (this.defaultPlayersList[this.teams[1].team] && !this.teams[1].players[1].name) {
          this.teams[1].players = this.defaultPlayersList[this.teams[1].team].map(v => ({name: v}))
        }

        // Check if all players have been set => update defaults
        if (this.teams[0].team && this.teams[0].team.length > 2 && this.teams[0].players.filter(v => v.name).length === 5 && (!this.defaultPlayersList[this.teams[0].team] || this.defaultPlayersList[this.teams[0].team].filter((v, i) => v !== this.teams[0].players[i].name).length > 0))  {
          this.defaultPlayersList[this.teams[0].team] = this.teams[0].players.map(v => v.name)
          localStorage.setItem(_stanzSheetTeamDefaults, JSON.stringify(this.defaultPlayersList))
        }
        if (this.teams[1].team && this.teams[1].team.length > 2 && this.teams[1].players.filter(v => v.name).length === 5 && (!this.defaultPlayersList[this.teams[1].team] || this.defaultPlayersList[this.teams[1].team].filter((v, i) => v !== this.teams[1].players[i].name).length > 0))  {
          this.defaultPlayersList[this.teams[1].team] = this.teams[1].players.map(v => v.name)
          localStorage.setItem(_stanzSheetTeamDefaults, JSON.stringify(this.defaultPlayersList))
        }

        this.$emit('input', this.teamSelection)
      }
    }
  },
  computed: {
    teamSelection () {
      let vodID = ''
      let vodType = ''
      const hostname = this.vodURL.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0]
      if (hostname === 'youtube.com' || hostname === 'youtu.be') {
        vodType = 'youtube'
        vodID = this.$youtube.getIdFromURL(this.vodURL)
      } else if (hostname === 'twitch.tv' || hostname === 'twitch.com') {
        vodType = 'twitch'
        const parts = this.vodURL.split(/\//)
        vodID = parts[parts.length - 1]
      }

      return {
        map: this.map,
        vod: {
          type: vodType,
          id: vodID,
        },
        teams: this.teams,
      }
    }
  },
  created () {
    let defaults = localStorage.getItem(_stanzSheetTeamDefaults)
    if (defaults === null) {
      defaults =  {"Gen G": ["effys", "gMd", "huynh", "MkaeL", "PLAYER1"], "TSM": ["Wardell", "Subroza", "drone", "hazed", "reltuC"]}
      localStorage.setItem(_stanzSheetTeamDefaults, JSON.stringify(defaults))
    } else {
      defaults = JSON.parse(defaults)
    }
    this.defaultPlayersList = defaults
  },
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
