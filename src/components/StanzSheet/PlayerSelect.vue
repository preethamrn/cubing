<template>
  <div class='player-select'>
    <v-stepper v-model='step' vertical>
      <v-stepper-step step='1'>Choose a map</v-stepper-step>
      <v-stepper-content step='1'>
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
                    @click='toggle'
                  >
                      <v-icon v-if='active'>fas fa-check</v-icon>
                    <v-row align='end' class='fill-height white--text'>
                      <h1>{{mapData.name}}</h1>
                    </v-row>
                  </v-img>
                </v-item>
              </v-col>
            </v-row>
          </v-container>
        </v-item-group>
      </v-stepper-content>

      <v-stepper-step step='2'>Choose the teams</v-stepper-step>
      <v-stepper-content step='2'>
        <v-text-field v-model='team1'></v-text-field>
        <v-text-field v-model='team2'></v-text-field>
      </v-stepper-content>
    </v-stepper>
  </div>
</template>

<script>
export default {
  name: 'player-select',
  data () {
    return {
      step: 1,
      map: '',
      team1: '',
      team2: '',
      players1: [], // list of player objects {name, agent}
      players2: [],
    }
  }
}
</script>

<style scope>
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
</style>
