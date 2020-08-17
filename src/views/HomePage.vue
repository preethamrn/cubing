<template>
  <v-main :style="{ paddingTop: 0 }" v-scroll='onScroll'>
    <v-toolbar dense :class='toolbarClass' style='width: 100%'>
      <v-row>
        <v-col cols='1'><a href='#'><v-icon>fas fa-home</v-icon></a></v-col>
        <v-col offset-md='3' offset-xs='0' cols='2' xs='3'>
          <a :style="{ 'height': '100%' }" href='#about-me'>
            <v-btn text :class='["font-weight-light", "toolbar-link"].concat(toolbarClass)'>ABOUT ME</v-btn>
          </a>
        </v-col>
        <v-col cols='2' xs='3'>
          <a :style="{ 'height': '100%' }" href='#experience'>
            <v-btn text :class='["font-weight-light", "toolbar-link"].concat(toolbarClass)'>EXPERIENCE</v-btn>
          </a>
        </v-col>
        <v-col cols='2' xs='3'>
          <a :style="{ 'height': '100%' }" href='#portfolio'>
            <v-btn text :class='["font-weight-light", "toolbar-link"].concat(toolbarClass)'>PORTFOLIO</v-btn>
          </a>
        </v-col>
      </v-row>
      <v-spacer></v-spacer>
      <v-layout>
        <v-flex md='1' xs='3'><a href='https://github.com/preethamrn' target='_blank'><v-icon :dark='top'>fab fa-github</v-icon></a></v-flex>
        <v-flex md='1' xs='3'><a href='https://www.linkedin.com/in/preethamrn' target='_blank'><v-icon :dark='top'>fab fa-linkedin</v-icon></a></v-flex>
        <v-flex md='1' xs='3'><a href='https://www.instagram.com/preethamrn' target='_blank'><v-icon :dark='top'>fab fa-instagram</v-icon></a></v-flex>
        <v-flex md='1' xs='3'><a href='https://www.youtube.com/channel/UC7tKYiFtH_6HCBD4hh7hTWw' target='_blank'><v-icon :dark='top'>fab fa-youtube</v-icon></a></v-flex>
        <v-flex md='1' xs='3'><a href='mailto:preetham.narayanareddy@gmail.com' target='_blank'><v-icon :dark='top'>fas fa-envelope</v-icon></a></v-flex>
      </v-layout>
    </v-toolbar>

    <TitleCard />
    <v-container fluid>
      <AboutMeCard />
      <ExperienceCard />
      <PortfolioCard />
    </v-container>
  </v-main>
</template>

<script>
  import TitleCard from '@/components/HomePage/TitleCard'
  import AboutMeCard from '@/components/HomePage/AboutMeCard'
  import ExperienceCard from '@/components/HomePage/ExperienceCard'
  import PortfolioCard from '@/components/HomePage/PortfolioCard'
  export default {
    components: {
      TitleCard,
      AboutMeCard,
      ExperienceCard,
      PortfolioCard
    },
    data: () => ({
      offsetTop: 0,
      top: true,
      toolbarClass: ['elevation-0', 'top']
    }),
    methods: {
      onScroll () {
        this.offsetTop = window.pageYOffset || document.documentElement.scrollTop
        if (this.offsetTop > window.innerHeight - 100) {
          this.toolbarClass = []
          this.top = false;
        } else {
          this.toolbarClass = ['elevation-0', 'top']
          this.top = true;
        }
      }
    }
  }
</script>

<style scoped>
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
  color: rgba(0, 0, 0, 0.9);
  margin: 0px 8px;
  height: 100%;
  width: 100%;
}
.toolbar-link.top {
  color: rgba(255, 255, 255, 0.9);
}

.container {
  padding: 0;
}
.layout.anchor-content {
  padding-top: 2em;
  padding-bottom: 1em;
}
.header-underline {
  height: 10px;
  width: 150px;
  background-color: rgba(255, 255, 255, 0.87);
  right: 5px;
  transform: translateX(5px);
  margin-bottom: 16px;
}
a {
  text-decoration: none;
}
</style>
