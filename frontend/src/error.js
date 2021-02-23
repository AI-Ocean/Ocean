import Vue from 'vue'

Vue.config.errorHandler = e => {
  console.error(e)
  Vue.toasted.error(e.message)
}
