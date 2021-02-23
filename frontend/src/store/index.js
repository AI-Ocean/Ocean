import Vue from 'vue'
import Vuex from 'vuex'
import userStore from '@/store/modules/userStore'
import resourceStore from '@/store/modules/resourceStore'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    userStore: userStore,
    resourceStore: resourceStore
  }
})
