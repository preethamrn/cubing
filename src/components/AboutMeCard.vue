<template>
  <v-layout row wrap id='about-me' class='anchor-content aboutme-content'>
    <v-flex offset-md3 offset-xs1 xs10>
      <span class='anchor-header'>ABOUT ME</span>
      <div class='header-underline'></div>
    </v-flex>
    <v-flex offset-md3 offset-xs1 md6 xs10>
      <span class='anchor-text'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pulvinar mattis nunc sed blandit libero volutpat sed. Odio aenean sed adipiscing diam donec adipiscing tristique. Egestas pretium aenean pharetra magna ac placerat vestibulum lectus. A diam sollicitudin tempor id eu nisl nunc mi. Nulla facilisi nullam vehicula ipsum a arcu cursus vitae congue. Sit amet cursus sit amet dictum. Condimentum mattis pellentesque id nibh tortor id aliquet. Congue nisi vitae suscipit tellus. Natoque penatibus et magnis dis parturient montes nascetur ridiculus. Vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant. Tempor nec feugiat nisl pretium fusce id velit. Dolor sit amet consectetur adipiscing elit. Pellentesque adipiscing commodo elit at imperdiet. Ac tincidunt vitae semper quis lectus nulla at volutpat. Odio facilisis mauris sit amet massa vitae tortor condimentum lacinia. Condimentum id venenatis a condimentum vitae sapien pellentesque habitant.
      </span>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'AboutMeCard',
  data: () => ({

  })
}
</script>

<style scoped>
.aboutme-content {
  background-color: #1b1829
}
.anchor-header {
  font-size: 3em;
  font-family: "Muli", Arial, Verdana, sans-serif;
  font-weight: 900;
  font-style: italic;
  color: rgba(255, 255, 255, 1)
}
.anchor-content {
  font-size: 1.5em;
  font-family: "Muli", Arial, Verdana, sans-serif;
  color: rgba(255, 255, 255, 1)
}
</style>
