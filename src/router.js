import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/HomePage.vue'
const TBLDTrainer = () => import( './views/3BLDTrainer.vue')
const Median = () => import( './views/Median.vue')
const Valorant = () => import( './views/Valorant.vue')

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'preethamrn',
      component: Home
    },
    {
      path: '/3bldtrainer',
      name: '3BLD Trainer',
      component: TBLDTrainer,
    },
    {
      path: '/median',
      name: 'Median',
      component: Median,
    },
    {
      path: '/valorant',
      name: 'Valorant',
      component: Valorant,
    },
  ]
})
