import Vue from 'vue'
import Toasted from 'vue-toasted'

Vue.use(Toasted, {
  iconPack: 'mdi'
})

Vue.toasted.register('error', (payload) => {
  return payload
}, {
  icon: 'mdi-alert-circle',
  position: 'bottom-right',
  duration: 5000,
  className: 'title',
  action: {
    text: 'close',
    onClick: (e, toastObject) => {
      toastObject.goAway(0)
    }
  }
})
