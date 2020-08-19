<template>
  <div class='stanz-sheet'>
    <h1>Stanz's Spreadsheet</h1>
    <v-tabs v-model='tab' background-color='deep-purple accent-4' class='elevation-2' dark grow>
      <v-tab :key='0'>Team Select</v-tab>
      <v-tab :key='1'>Match Data</v-tab>
    </v-tabs>

    <v-tabs-items v-model='tab'>
      <v-tab-item :key='0'><player-select v-model='teamSelection' /></v-tab-item>
      <v-tab-item :key='1'>Match Data Placeholder</v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import PlayerSelect from '@/components/StanzSheet/PlayerSelect'

export default {
  name: 'stanz-sheet',
  components: {
    PlayerSelect,
  },
  data () {
    return {
      tab: 0,
      teamSelection: {},
    }
  },
}
</script>

<style scoped>
h1 {
  padding-left: 10px;
  font-size: 50px;
  font-weight: 500;
  font-family: Roboto,Helvetica,Arial,sans-serif;
}
</style>
