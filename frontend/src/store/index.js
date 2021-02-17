import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    title: 'origin title',
    user: null,
    token: '',
    isInit: false
    // claims: null,
    // firebaseLoaded: false
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
    setIsInit (state, isInit) {
      state.isInit = isInit
    }
  },
  actions: {
    async signIn ({ dispatch }, siginObj) {
      try {
        const { data } = await Vue.prototype.$axios.post('/api/signin', siginObj)
        const token = data.token
        localStorage.setItem('token', token)
        await dispatch('getUserInfo')
      } catch (err) {
        console.error(err)
      }
    },
    signOut ({ commit }) {
      commit('setToken', null)
      commit('setUser', null)
    },
    async getUserInfo ({ commit }) {
      console.log('getUserInfo')
      const token = localStorage.getItem('token')
      if (token) {
        commit('setToken', token)
        const { data } = await Vue.prototype.$axios.get('/api/users/me')
        commit('setUser', data.user)
      }
      commit('setIsInit', true)
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
    },
    isAdmin (state) {
      return state.user && state.user.role === 'admin'
    }
  }
})
