import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    title: 'origin title',
    user: null,
    token: '',
    claims: null,
    firebaseLoaded: false
  },
  mutations: {
    setTitle (state, payload) {
      state.title = payload
    },
    setUser (state, user) {
      state.user = user
    },
    setToken (state, token) {
      state.token = token
    },
    setClaims (state, claims) {
      state.claims = claims
    },
    setFirebaseLoaded (state, firebaseLoaded) {
      state.firebaseLoaded = firebaseLoaded
    }
  },
  actions: {
    async getUser ({ commit }, user) {
      commit('setUser', user)
      if (user) {
        const token = await user.getIdToken(true)
        commit('setToken', token)

        const { claims } = await user.getIdTokenResult(true)
        commit('setClaims', claims)
      }
      commit('setFirebaseLoaded', true)
    }
  },
  getters: {
    userID (state) {
      return state.user.email.split('@')[0]
    },
    namePrefix (state) {
      return state.user.email.split('@')[0].replace(/[^\w\s]/gi, '') + '-'
    }
  }
})
