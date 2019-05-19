<template>
  <v-layout row wrap id='portfolio' class='anchor-content portfolio-content'>
    <v-flex offset-md3 offset-xs1 xs10>
      <span class='anchor-header'>PORTFOLIO</span>
      <div class='header-underline'></div>
    </v-flex>
    <v-flex offset-md3 offset-xs1 md6 xs10>
      <PortfolioItem />
    </v-flex>
  </v-layout>
</template>

<script>
import PortfolioItem from '@/components/PortfolioItem'
export default {
  name: 'PortfolioCard',
  components: {
    PortfolioItem
  },
  data: () => ({

  })
}
</script>

<style scoped>
.portfolio-content {
  background-color: #1b1829
}

.anchor-header {
  font-size: 3em;
  font-family: 'Muli', Arial, Verdana, sans-serif;
  font-weight: 900;
  font-style: italic;
  color: rgba(255, 255, 255, 1)
}
.anchor-content {
  font-size: 1.5em;
  font-weight: 650;
  font-family: 'Muli', Arial, Verdana, sans-serif;
  color: rgba(255, 255, 255, 1)
}
</style>
