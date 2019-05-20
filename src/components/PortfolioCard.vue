<template>
  <v-layout row wrap id='portfolio' class='anchor-content portfolio-content'>
    <v-flex offset-md3 offset-xs1 xs10>
      <span class='anchor-header'>PORTFOLIO</span>
      <div class='header-underline'></div>
    </v-flex>
    <v-flex offset-md3 offset-xs1 md6 xs10>
      <PortfolioItem v-for='item in items'
        :key='item.name'
        :name='item.name'
        :image='item.image'
        :technologies='item.technologies'
        :links='item.links'
        :timeRange='item.timeRange'
        :description='item.description'
      />
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
    items: [
      {
        name: 'Blob v0.1',
        image: '../projects/blobv1.png',
        technologies: ['C++', 'SDL'],
        links: [{
            type: 'github',
            link: 'https://github.com/preethamrn/BLOBv0.1'
          }
        ],
        timeRange: 'December 2014',
        description: 'Multiplayer Desktop game similar to Bomberman with Capture the Flag and Zombies gamemodes added. \
          Save settings locally using file I/O. Supports up to 4 players.'
      },
      {
        name: 'BruinMenu',
        image: '../projects/bruinmenu.png',
        technologies: ['Android', 'Java', 'JSoup', 'SQLite'],
        links: [
          {
            type: 'link',
            link: 'play.google.com/store/apps/details?id=com.rhombus.bruinmenu'
          },{
            type: 'github',
            link: 'https://github.com/preethamrn/BruinMenu'
          }
        ],
        timeRange: 'November 2015',
        description: 'An application that displays the daily menus of all the UCLA dining halls, shows nutritional data of food, and keeps track of favorites and swipes remaining.'
      },
      {
        name: 'Card Game Online',
        image: '../projects/cgo.png',
        technologies: ['Unity', 'C#'],
        links: [{
            type: 'github',
            link: 'https://github.com/preethamrn/CardGameOnline'
          }
        ],
        timeRange: 'August 2016',
        description: 'Game for playing any digitized table top card game online with friends. Built the input processing systems and card mechanics.'
      },
      {
        name: 'Dissonance',
        image: '../projects/dissonance.png',
        technologies: ['Unity', 'C#'],
        links: [{
            type: 'github',
            link: 'https://github.com/preethamrn/Dissonance'
          }
        ],
        timeRange: 'October 2016',
        description: 'Multiplayer rhythm based PvP game. Shoot projectiles at the opponent while dodging your opponents projectiles and maintaining the rhythm. Built the networking, input processing, and beat recognition systems.'
      },
      {
        name: 'Frackman',
        image: '../projects/frackman.png',
        technologies: ['C++'],
        links: [{
            type: 'github',
            link: 'https://github.com/preethamrn/Frackman'
          }
        ],
        timeRange: 'March 2016',
        description: 'UCLA CS project to build a game similar to Dig Dug (the 1982 Namco classic).'
      },
      {
        name: 'Scott Simulator',
        image: '../projects/scottsim.png',
        technologies: ['Javascript', 'WebGL', 'GLSL'],
        links: [{
            type: 'link',
            link: 'https://preethamrn.github.io/ScottSimulator'
          },{
            type: 'github',
            link: 'https://github.com/preethamrn/ScottSimulator'
          }
        ],
        timeRange: 'March 2017',
        description: 'WebGL game similar to The Stanley Parable set in UCLA and written using WebGL from scratch. Earned most impressive and second most favorite project out of 27. Build the Game State Machine, Game Logic, and Audio Engine.'
      },
      {
        name: 'Simple Scheduler',
        image: '../projects/simplescheduler.png',
        technologies: ['Android', 'Java'],
        links: [{
            type: 'link',
            link: 'https://play.google.com/store/apps/details?id=com.rhombus.mymanager'
          },{
            type: 'github',
            link: 'https://github.com/preethamrn/SimpleScheduler'
          }
        ],
        timeRange: 'November 2014',
        description: 'A calendar based note taking application in Android. Notes are color coded and unfinished tasks are carried from one day to the next.'
      },
      {
        name: 'FooDrop',
        image: '../projects/foodrop.png',
        technologies: ['Javascript', 'Vue', 'Vuetify', 'Node.js', 'MongoDB', 'UML'],
        links: [{
            type: 'link',
            link: 'https://github.com/preethamrn/fooDrop/blob/master/papers/CS_130___Part_C.pdf'
          },{
            type: 'github',
            link: 'https://github.com/preethamrn/FooDrop'
          }
        ],
        timeRange: 'December 2018',
        description: 'A feature-rich web application with an intuitive user interface to help our sellers sell their leftovers to other nearby buyers in order to provide a cheap alternative for eaters and reduce food waste for sellers. Uses Facebook OAuth for login, and the Google Maps API to select food pickup locations.'
      },
      {
        name: 'preethamrn.com',
        image: '../projects/preethamrn.png',
        technologies: ['Javascript', 'Vue', 'Vuetify'],
        links: [{
            type: 'link',
            link: 'http://www.preethamrn.com'
          },{
            type: 'github',
            link: 'https://github.com/preethamrn/preethamrn.github.io'
          }
        ],
        timeRange: 'May 2019',
        description: 'You\'re reading it right now! :)'
      },
      {
        name: 'CubersLive.com',
        image: '../projects/cuberslive.png',
        technologies: ['Javascript', 'Vue', 'Vuetify', 'Node.js', 'MongoDB'],
        links: [{
            type: 'link',
            link: 'https://www.cuberslive.com'
          },{
            type: 'gilab',
            link: 'https://gitlab.com/preethamrn/CubeOnline'
          }
        ],
        timeRange: 'May 2019',
        description: "A cloud based Rubik's cube timer that allows multiple users to solve the same scramble simultaneously. This enables cubers to finally race each other online in real-time."
      }
    ]
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
