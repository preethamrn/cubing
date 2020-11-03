<template>
  <v-dialog v-model='modal' width="500" >
    <template v-slot:activator="{ on }">
      <button v-on='on'>Settings</button>
    </template>
    <v-card>
      <v-card-title class="headline grey lighten-2">
        Settings
      </v-card-title>
      <v-card-text>
        <b>How do you want to select algs?</b>
        <v-select v-model="selector" :items="[{'name': 'Randomly', 'type': 'random'}, {'name': 'Sequentially', 'type': 'sequential'}, {'name': 'Shuffled', 'type': 'shuffled'}]" item-text='name' item-value='type' />
        <b>What alg set would you like to train?</b>
        <v-select v-model="algSet" :items='Object.keys(ALG_SETS)' />
        <v-switch v-model="hideAlg" inset>
          <template v-slot:label>
            <b>{{hideAlg ? 'Show alg' : 'Hide alg'}}</b>
          </template>
        </v-switch>
        <b>What timer would you like to use?</b>
        <v-select v-model="timer" :items="[{'name': 'Browser time', 'type': 'browser'}, {'name': 'Inbuilt cube timestamps', 'type': 'cube'}]" item-text='name' item-value='type' />
        <b>How long should the the trainer wait between solves (set to 0 for no pause)?</b>
        <!-- TODO: support infinite wait time (trigger next solve manually) -->
        <v-slider v-model="waitTime" color="orange" label="Time (ms)" min="0" max="3000" step="50" thumb-label></v-slider>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <!-- TODO: changing certain settings (eg. waitTime) shouldn't reset the alg set -->
        <v-btn color="primary" text @click="modal = false; $emit('input', {algSet, selector, timer, waitTime, hideAlg});">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {getFromLocalStorage} from "../../utils/utils"
import {ALG_SETS} from "./alg_sets"

export default {
  name: 'settings',
  data: () => ({
    modal: false,
    algSet: '',
    selector: '',
    hideAlg: false,
    timer: '',
    waitTime: 1000,
  }),
  props: {
    value: Object,
  },
  methods: {
    updateValues (value) {
      this.algSet = value.algSet
      this.selector = value.selector
      this.hideAlg = value.hideAlg
      this.timer = value.timer
      this.waitTime = value.waitTime
    }
  },
  watch: {
    value () {
      this.updateValues(this.value)
    }
  },
  created () {
    this.ALG_SETS = ALG_SETS
    let value = getFromLocalStorage('algTrainerSettings', {algSet: "PLL", selector: "random", timer: "browser", waitTime: 1000, hideAlg: false})
    this.updateValues(value)
    this.$emit('input', value)
  }
}
</script>

<style scoped>

</style>
