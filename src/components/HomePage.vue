<template>
  <v-content :style="{ paddingTop: 0 }" v-scroll='onScroll'>
    <v-toolbar dense :flat='toolbarFlat' :color='toolbarColor' app>
      <v-toolbar-title class='headline text-uppercase'>
        <v-layout>
          <a href='#about-me'><span class='font-weight-light toolbar-link'>ABOUT ME</span></a>
          <span class='font-weight-light toolbar-link'>EXPERIENCE</span>
          <span class='font-weight-light toolbar-link'>PORTFOLIO</span>
        </v-layout>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      TODO: icons
    </v-toolbar>

    <v-layout id='title'>
      <v-card dark flat class='title-card'>
        title
      </v-card>
    </v-layout>
    <v-container>
      <v-layout id='about-me'>
        <v-card flat class='anchor-content'>
          about me
        </v-card>
      </v-layout>
      <v-layout>
        <v-card flat class='anchor-content'>
          experience
        </v-card>
      </v-layout>
      <v-layout>
        <v-card flat class='anchor-content'>
          portfolio
        </v-card>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
  export default {
    data: () => ({
      offsetTop: 0,
      toolbarColor: "rgba(0, 0, 0, 0)",
      toolbarFlat: true
    }),
    methods: {
      onScroll () {
        this.offsetTop = window.pageYOffset || document.documentElement.scrollTop
        if (this.offsetTop > window.innerHeight - 100) {
          this.toolbarColor= "rgba(255, 255, 255, 0.5)",
          this.toolbarFlat= false
        } else {
          this.toolbarColor= "rgba(0, 0, 0, 0)",
          this.toolbarFlat= true
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
.toolbar-link {
  padding-right: 1em;
  font-size: 0.5em;
}

.v-card.anchor-content {
  margin-top: 150px;
  height: 500px;
}
.v-card.title-card {
  width: 100vw;
  height: 100vh;
}
</style>
