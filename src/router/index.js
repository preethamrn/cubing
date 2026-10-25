import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  },
  routes: [
    { path: '/', redirect: { name: 'alg-trainer' } },
    {
      path: '/algtrainer',
      name: 'alg-trainer',
      component: () => import('../views/AlgTrainer.vue'),
      meta: { title: 'Algorithm trainer' },
    },
    {
      path: '/3bldtrainer',
      name: '3bld-trainer',
      component: () => import('../views/3BLDTrainer.vue'),
      meta: { title: '3BLD memo trainer' },
    },
    {
      path: '/median',
      name: 'median',
      component: () => import('../views/Median.vue'),
      meta: { title: 'MonkeyLeague median calculator' },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'alg-trainer' } },
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Cubing Lab'} · Cubing Lab`
})

export default router
