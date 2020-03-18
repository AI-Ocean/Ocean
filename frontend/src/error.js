import Vue from 'vue'

Vue.config.errorHandler = e => {
  console.log(e)
  Vue.toasted.error(e.message)
}
