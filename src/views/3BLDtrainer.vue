<template>
  <div class="3bldtrainer">
    <h1>3BLD Trainer</h1>
    <v-container>
      <v-flex xs2 ref='s1'></v-flex>
      <v-flex xs2 ref='s2'></v-flex>
      <v-flex xs2 ref='s3'></v-flex>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'BLDTrainer3',
  data: () => ({
    colors: {
      'U': 'white',
      'L': 'orange',
      'F': 'green',
      'R': 'red',
      'B': 'blue',
      'D': 'yellow'
    },
    corners: ['UBL','URB','UFR','ULF','LUB','LFU','LDF','LBD','FUL','FRU','FDR','FLD','RUF','RBU','RDB','RFD','BUR','BLU','BDL','BRD','DFL','DRF','DBR','DLB'],
    edges: ['UB','UR','UF','UL','LU','LF','LD','LB','FU','FR','FD','FL','RU','RB','RD','RF','BU','BL','BD','BR','DF','DR','DB','DL']
  }),
  methods: {
    next () {
      console.log(this.$refs['s1'])
      console.log(this.$refs['s2'])
      console.log(this.$refs['s3'])
    }
  },
  mounted: function () {
    this.next()
  }
}
</script>

<style scoped>

</style>
