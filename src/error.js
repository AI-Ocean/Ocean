import Vue from 'vue'

Vue.config.errorHandler = e => {
  Vue.toasted.global.error(e.message)
}
