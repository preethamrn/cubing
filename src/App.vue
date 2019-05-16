<template>
  <v-app>
    <HomePage/>
  </v-app>
</template>

<script>
import HomePage from './components/HomePage'

export default {
  name: 'App',
  components: {
    HomePage
  },
  data () {
    return {
      //
    }
  }
}
</script>

<style>
@font-face {
  font-family: "Monument";
  src: url("./assets/MonumentExtended-Regular.otf");
}
html {
  scroll-behavior: smooth;
}
</style>