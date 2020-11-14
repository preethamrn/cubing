import Vue from 'vue'
import Router from 'vue-router'
const AlgTrainer = () => import( '../views/AlgTrainer.vue')
const TBLDTrainer = () => import( '../views/3BLDTrainer.vue')
const Median = () => import( '../views/Median.vue')

Vue.use(Router)

const router = new Router({
  base: '/cubing/',
  mode: 'history',
  routes: [
    {
      path: '/algtrainer',
      name: 'Alg Trainer',
      component: AlgTrainer,
      meta: {title: 'Alg Trainer'},
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
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'preethamrn'
  next()
})

export default router
