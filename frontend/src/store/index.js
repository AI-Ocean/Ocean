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
    }
    // setClaims (state, claims) {
    //   state.claims = claims
    // },
    // setFirebaseLoaded (state, firebaseLoaded) {
    //   state.firebaseLoaded = firebaseLoaded
    // }
  },
  actions: {
    // async getUser ({ commit }, user) {
    //   commit('setUser', user)
    //   if (user) {
    //     const token = await user.getIdToken(true)
    //     commit('setToken', token)

    //     const { claims } = await user.getIdTokenResult(true)
    //     commit('setClaims', claims)
    //   }
    //   commit('setFirebaseLoaded', true)
    // },
    async signInToken ({ commit }, token) {
      try {
        // const { data } = await this.$axios.post('/api/signin', user)
        commit('setToken', token)
        // parse jwt
        let base64Url = token.split('.')[1]
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))

        const user = JSON.parse(jsonPayload)
        commit('setUser', user)
      } catch (err) {
        console.error(err)
      }
    },
    signOut ({ commit }) {
      commit('setToken', null)
      commit('setUser', null)
    }
  },
  getters: {
    userID (state) {
      return state.user ? state.user.email.split('@')[0] : null
    },
    namePrefix (state) {
      return state.user ? state.user.email.split('@')[0].replace(/[^\w\s]/gi, '') + '-' : null
    },
    role (state) {
      return state.user ? state.user.role : null
    }
  }
})
