<template>
  <v-flex md4 xs12>
    <v-card>
      <v-img
        :src='image'
        height='200px'
      ></v-img>
      <v-card-title primary-title>
        <div>
          <div>
            <div class='headline'> {{ name }} </div>
            <div class='subtitle'> {{ timeRange }} </div>
          </div>
          <v-chip v-for='tech in technologies' :key='tech'> {{ tech }} </v-chip>
        </div>
      </v-card-title>

      <v-card-actions>
        <div v-for='link in links' :key='link.link'>
          <a :href='link.link' target='_blank'>
            <v-btn v-if="link.type === 'link'" flat color='purple'><v-icon>fas fa-link</v-icon></v-btn>
            <v-btn v-if="link.type === 'github'" flat color='purple'><v-icon>fab fa-github</v-icon></v-btn>
            <v-btn v-if="link.type === 'gitlab'" flat color='purple'><v-icon>fab fa-gitlab</v-icon></v-btn>
          </a>
        </div>
        <v-spacer></v-spacer>
        <v-btn icon @click='show = !show'>
          <v-icon>{{ show ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
        </v-btn>
      </v-card-actions>
      <v-slide-y-transition>
          <v-card-text v-show="show">
            {{ description }}
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
  }),
  props: {
    name: String,
    image: String,
    technologies: Array,
    links: Array,
    timeRange: String,
    description: String
  }
}
</script>

<style scoped>
.v-btn {
  min-width: 50px;
}
.headline {
  font-family: "Muli", Arial, Verdana, sans-serif !important;
  font-weight: 700;
}
.subtitle {
  font-family: "Muli", Arial, Verdana, sans-serif !important;
  font-weight: 500;
  font-size: 0.75em;
  color: rgba(61, 61, 61, 0.849)
}
.v-card__text {
  font-weight: 600;
  font-size: 0.75em;
}
.v-card.v-sheet {
  margin-bottom: 40px;
}
</style>
