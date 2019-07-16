import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/HomePage.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'preethamrn',
      component: Home
    },
    {
      path: '/3bldtrainer',
      name: '3BLD Trainer',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "3bldtrainer" */ './views/3BLDTrainer.vue')
    }
  ]
})
