<template>
  <v-flex md4 xs12>
    <v-card>
      <v-img
        src='../projects/blobv1.png'
        height='200px'
      ></v-img>
      <v-card-title primary-title>
        <div>
          <div class='headline'>Blob v0</div>
          <span class='grey--text'>Technologies: </span>
        </div>
      </v-card-title>

      <v-card-actions>
        <v-btn flat>Link</v-btn>
        <v-btn flat color='purple'><v-icon>fab fa-github</v-icon></v-btn>
        <v-spacer></v-spacer>
        <v-btn icon @click='show = !show'>
          <v-icon>{{ show ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
        </v-btn>
      </v-card-actions>
      <v-slide-y-transition>
          <v-card-text v-show="show">
            I'm a thing. But, like most politicians, he promised more than he could deliver. You won't have time for sleeping, soldier, 
            not with all the bed making you'll be doing. Then we'll go with that data file! Hey, you add a one and two zeros to that or we walk! 
            You're going to do his laundry? I've got to find a way to escape.
          </v-card-text>
        </v-slide-y-transition>
    </v-card>
  </v-flex>
</template>

<script>
export default {
  name: 'PortfolioItem',
  data: () => ({
    show: false
  })
}
</script>

<style>

</style>