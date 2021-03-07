import Vue from 'vue'

Vue.config.errorHandler = e => {
  Vue.toasted.error(e.message)
}
