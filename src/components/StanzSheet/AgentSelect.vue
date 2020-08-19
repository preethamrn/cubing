<template>
  <div>
    <v-item-group :value='value' @change='$emit("input", $event)'>
      <v-row no-gutters>
        <v-item 
          v-for='agentData in [
            {name: "Breach", img: "valorant/breach.png"},
            {name: "Brimstone", img: "valorant/brimstone.png"},
            {name: "Cypher", img: "valorant/cypher.png"},
            {name: "Jett", img: "valorant/jett.png"},
            {name: "Killjoy", img: "valorant/killjoy.png"},
            {name: "Omen", img: "valorant/omen.png"},
            {name: "Phoenix", img: "valorant/phoenix.png"},
            {name: "Raze", img: "valorant/raze.png"},
            {name: "Reyna", img: "valorant/reyna.png"},
            {name: "Sage", img: "valorant/sage.png"},
            {name: "Sova", img: "valorant/sova.png"},
            {name: "Viper", img: "valorant/viper.png"},
          ]'
          :key='agentData.name'
          v-slot:default='{ active, toggle }' :value='agentData.name'>
            <v-col cols='1'>
              <v-img
                :src='agentData.img'
                height='100'
                class='pa-1'
                @click='toggle'
              >
                <v-btn icon>
                  <v-icon style='color: black'>
                    {{ active ? 'fas fa-check-circle' : '' }}
                  </v-icon>
                </v-btn>
              </v-img>
            </v-col>
        </v-item>
      </v-row>
    </v-item-group>
  </div>
</template>

<script>
export default {
  name: 'agent-select',
  data () {
    return {}
  },
  props: {
    value: String,
  }
}
</script>
