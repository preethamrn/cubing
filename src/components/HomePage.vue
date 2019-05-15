<template>
  <v-content :style="{ paddingTop: 0 }" v-scroll='onScroll'>
    <v-toolbar dense :class='toolbarClass'>
      <!--<v-toolbar-title class='headline'>
        <span class='toolbar-header'> p </span>
      </v-toolbar-title>-->
      <v-layout>
        <v-flex offset-md3 offset-xs0 xs2>
          <a :style="{ 'height': '100%' }" href='#about-me'>
            <v-btn flat :class='["font-weight-light", "toolbar-link"].concat(toolbarClass)'>ABOUT ME</v-btn>
          </a>
        </v-flex>
        <v-flex xs2>
          <a :style="{ 'height': '100%' }" href='#experience'>
            <v-btn flat :class='["font-weight-light", "toolbar-link"].concat(toolbarClass)'>EXPERIENCE</v-btn>
          </a>
        </v-flex>
        <v-flex xs2>
          <a :style="{ 'height': '100%' }" href='#portfolio'>
            <v-btn flat :class='["font-weight-light", "toolbar-link"].concat(toolbarClass)'>PORTFOLIO</v-btn>
          </a>
        </v-flex>
      </v-layout>
      <v-spacer></v-spacer>
      TODO: icons
    </v-toolbar>

    <TitleCard />
    <v-container>
      <AboutMeCard />
      <ExperienceCard />
      <PortfolioCard />
    </v-container>
  </v-content>
</template>

<script>
  import TitleCard from '@/components/TitleCard'
  import AboutMeCard from '@/components/AboutMeCard'
  import ExperienceCard from '@/components/ExperienceCard'
  import PortfolioCard from '@/components/PortfolioCard'
  export default {
    components: {
      TitleCard,
      AboutMeCard,
      ExperienceCard,
      PortfolioCard
    },
    data: () => ({
      offsetTop: 0,
      toolbarClass: ['elevation-0', 'top']
    }),
    methods: {
      onScroll () {
        this.offsetTop = window.pageYOffset || document.documentElement.scrollTop
        if (this.offsetTop > window.innerHeight - 100) {
          this.toolbarClass = []
        } else {
          this.toolbarClass = ['elevation-0', 'top']
        }
      }
    }
  }
</script>

<style>
.v-toolbar {
  position: fixed;
  top: 0;
  z-index: 64;
}
.v-toolbar.top {
  background-color: rgba(0, 0, 0, 0);
  border-color: rgba(0, 0, 0, 0);
}
.v-toolbar__title.headline {
  font-family: "Lucida Console", Monaco, monospace !important
}
.toolbar-link {
  padding-right: 1em;
  font-size: 1em;
  color: rgba(255, 255, 255, 0.9);
  margin: 0px 8px;
  height: '100%'
}
.toolbar-link.top {
  color: rgba(255, 255, 255, 0.9);
}

.layout.anchor-content {
  margin-top: 150px;
  height: 500px;
}
.layout.title-card {
  width: 100vw;
  height: 100vh;
}
a {
  text-decoration: none;
}
</style>
