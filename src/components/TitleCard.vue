<template>
  <v-layout id='title' :style="{ 'background':'url(\'intro-bg.jpg\')' }" class='title-card'>
    <v-flex offset-md2 offset-xs0 md2 xs12 text-xs-center>
      <v-avatar
        :size='200'
        style='top: 25%'
        color='grey lighten-4'
      >
        <img src='https://vuetifyjs.com/apple-touch-icon-180x180.png' alt='avatar'>
      </v-avatar>
    </v-flex>
    <v-flex md6 xs12>
      <span :style="{ 'font-family':'\'Lucida Console\', Monaco, monospace !important' }">
        This is a test
      </span>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'TitleCard',
  data: () => ({

  })
}
</script>

<style>

</style>
