<template>
  <div class="3bldtrainer">
    <v-container style='padding-top: 20px'>
      <h1 style='padding-bottom: 20px'>3BLD Trainer</h1>
      <v-layout row>
        <div ref='s1' class='sticker-box'></div>
        <div ref='s2' class='sticker-box'></div>
      </v-layout>
      <v-layout row>
        <div ref='s3' class='sticker-box'></div>
        <input class='' placeholder="mobile users type here" />
      </v-layout>
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
.sticker-box {
  height: 100px !important;
  width: 100px !important;
  margin: 5px;
  background: red;
}
</style>
