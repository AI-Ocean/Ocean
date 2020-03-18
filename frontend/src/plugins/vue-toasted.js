import Vue from 'vue'
import Toasted from 'vue-toasted'

Vue.use(Toasted, {
  position: 'bottom-left',
  duration: 5000,
  keepOnHover: true,
  action: [
    {
      icon: 'mdi-close-circle',
      onClick: (e, toastObject) => {
        toastObject.goAway(0)
      }
    }
  ],
  iconPack: 'mdi'
})
