<template>
  <div>
    <v-text-field style='width: 0px; position: fixed; bottom: 0' v-model='search' @keydown.enter='$emit("input", agentsList[0].name)'></v-text-field>
    <v-item-group :value='value' @change='$emit("input", $event)'>
      <v-row no-gutters>
        <v-item 
          v-for='agentData in agentsList'
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
    return {
      search: '',
    }
  },
  props: {
    value: String,
  },
  computed: {
    agentsList () {
      return [
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
      ].filter((v) => (!this.search || v.name.toLowerCase().includes(this.search)))
    }
  }
}
</script>
