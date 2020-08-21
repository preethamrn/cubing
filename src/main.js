import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import VueYouTubeEmbed from 'vue-youtube-embed'
import LoadScript from 'vue-plugin-load-script'

Vue.config.productionTip = false
Vue.use(VueYouTubeEmbed)
Vue.use(LoadScript) // required for loading twitch embed

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
