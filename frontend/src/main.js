import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from '@/plugins/vuetify'
import error from './error'
import './plugins'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  error,
  beforeCreate () {
    this.$store.dispatch('getUserInfo')
      .catch(() => {
        localStorage.removeItem('token')
        router.go('/sign')
      })
  },
  render: h => h(App)
}).$mount('#app')
