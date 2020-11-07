<template>
  <v-dialog v-model='modal' persistent width="800" >
    <v-card>
      <v-card-title class="headline grey lighten-2">
        Choose the list of algs to use
      </v-card-title>
      <v-card-text>
        <!-- loop through algs and have a checkbox for each one -->
        <v-row v-for="(alg, index) in ALG_SETS[algSet].list" :key="index">
          <v-col cols='1'><b>{{alg.name}}</b></v-col>
          <v-col cols='5'>{{alg.alg}}</v-col>
          <v-spacer></v-spacer>
          <v-col cols='1' @click="$set(algsList, index, !algsList[index])">
            <v-icon v-if="algsList[index] === true">fas fa-check-square</v-icon>
            <v-icon v-else>far fa-check-square</v-icon>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" text @click="selectAll">Select All</v-btn>
        <v-btn color="green" text @click="deselectAll">Deselect All</v-btn>
        <v-btn color="red" text @click="modal = false; nosaveCustomSelector();">Close</v-btn>
        <v-btn color="primary" text @click="modal = false; saveCustomSelector();">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {ALG_SETS} from "./alg_sets"

export default {
  name: 'custom-selector',
  data: () => ({
    modal: false,
    algsList: [],
  }),
  props: {
    algSet: String,
  },
  methods: {
    openModal () {
      this.modal = true
    },
    nosaveCustomSelector () {
      let customAlgs = localStorage.getItem('customAlgSet')
      if (!customAlgs) {
        localStorage.setItem('customAlgSet', JSON.stringify({name: "PLL", list: [0, 1]}))
      }
    },
    saveCustomSelector () {
      // Save selection to localStorage.
      // This will be pulled from localStorage each time the algs are loaded in AlgTrainer and the settings are saved in Settings.
      localStorage.setItem('customAlgSet', JSON.stringify({
        name: this.algSet,
        list: this.algNums,
      }))
    },
    selectAll () {
      this.algsList.forEach((v,i) => {this.$set(this.algsList, i, true)})
    },
    deselectAll () {
      this.algsList.forEach((v,i) => {this.$set(this.algsList, i, false)})
    },
  },
  watch: {
    algSet: {
      immediate: true,
      handler () {
        this.algsList = new Array(ALG_SETS[this.algSet].list.length).fill(false)
        
        // backfill any algs that have already been set
        let customAlgs = localStorage.getItem('customAlgSet')
        customAlgs = JSON.parse(customAlgs)
        if (customAlgs && customAlgs.name === this.algSet) {
          customAlgs.list.forEach(v => {
            this.algsList[v] = true
          })
        }
      }
    }
  },
  computed: {
    algNums () {
      let algNums = []
      this.algsList.forEach((v, i) => {
        if (v) algNums.push(i)
      })
      return algNums
    }
  },
  created () {
    this.ALG_SETS = ALG_SETS
  }
}
</script>

<style scoped>

</style>
