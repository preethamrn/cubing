import Vue from 'vue'
import Router from 'vue-router'
import Home from '../views/HomePage.vue'
const TBLDTrainer = () => import( '../views/3BLDTrainer.vue')
const Median = () => import( '../views/Median.vue')
const Valorant = () => import( '../views/Valorant.vue')
const StanzSheet = () => import( '../views/StanzSheet.vue')

Vue.use(Router)

const router = new Router({
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
      meta: {title: '3BLD Trainer'},
    },
    {
      path: '/median',
      name: 'Median',
      component: Median,
      meta: {title: 'MonkeyLeague Median'},
    },
    {
      path: '/valorant',
      name: 'Valorant',
      component: Valorant,
      meta: {title: 'Valorant Player History'},
    },
    {
      path: '/stanzsheet',
      name: "StanzSheet",
      component: StanzSheet,
      meta: {title: "Stanz's Spreadsheet"},
    },
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'preethamrn'
  next()
})

export default router