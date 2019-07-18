<template>
  <div class="bldtrainer3">
    <v-container>
      <h1 style='padding: 20px 0 20px 0'>3BLD Trainer</h1>
      <v-layout row>
        <div :style='{display: testCorners ? "inline" : "none", background: s1bg}' class='sticker-box'></div>
        <div :style='{display: testCorners ? "inline" : "none", background: s2bg}' class='sticker-box'></div>
      </v-layout>
      <v-layout row>
        <div :style='{display: testCorners ? "inline" : "none", background: s3bg}' class='sticker-box'></div>
        <input class='' placeholder="click on mobile" />
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
    edges: ['UB','UR','UF','UL','LU','LF','LD','LB','FU','FR','FD','FL','RU','RB','RD','RF','BU','BL','BD','BR','DF','DR','DB','DL'],
    testCorners: true,

    s1bg: 'red',
    s2bg: 'blue',
    s3bg: 'white'
  }),
  methods: {
    next () {

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
.bldtrainer3 {
  background: #eeeeee;
  height: 100vh;
}
</style>
