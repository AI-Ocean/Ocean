import Vue from 'vue'

const userStore = {
  state: {
    title: 'origin title',
    user: null,
    token: '',
    isInit: false
  },
  mutations: {
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
      const { data } = await Vue.prototype.$axios.post('/api/signin', siginObj)
      const token = data.token
      localStorage.setItem('token', token)
      await dispatch('getUserInfo')
    },
    signOut ({ commit }) {
      commit('setToken', null)
      commit('setUser', null)
      localStorage.removeItem('token')
    },
    async getUserInfo ({ commit, dispatch }) {
      const token = localStorage.getItem('token')
      if (token) {
        // token exp check
        var payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp - (Date.now() / 1000) < 0) {
          dispatch('signOut')
        }
        // check ok
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
    isAdmin (state) {
      return state.user && state.user.role === 'admin'
    }
  }
}

export default userStore
