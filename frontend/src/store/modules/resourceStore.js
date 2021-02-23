import Vue from 'vue'

const calcUsage = (state, type) => {
  let base
  if (type === 'capacity') {
    base = state.volumes
  } else {
    // if (this.$store.getters.isAdmin) {
    //   base = state.instances
    // } else {
    base = state.instances.concat(state.jobs)
    // }
    base = base.filter(v => v.status === 'Running' || v.status === 'Pending')
  }
  return base
    .map(v => Number(v[type]))
    .reduce((a, b) => a + b, 0)
}

const resourceStore = {
  namespaced: true,
  state: {
    instances: [],
    volumes: [],
    jobs: [],
    resources: {
      cpus: {
        limit: 0, using: 0
      },
      memory: {
        limit: 0, using: 0
      },
      gpus: {
        limit: 0, using: 0
      },
      capacity: {
        limit: 0, using: 0
      }
    },
    loadingInstances: false,
    loadingVolumes: false,
    loadingJobs: false
  },
  mutations: {
    setInstances (state, instances) {
      state.instances = instances
    },
    setVolumes (state, volumes) {
      state.volumes = volumes
    },
    setJobs (state, jobs) {
      state.jobs = jobs
    },
    setResources (state, resources) {
      state.resources = resources
      // Object.assign(state.resources, resources)
    },

    setLoadingInstances (state, load) {
      state.loadingInstances = load
    },
    setLoadingVolumes (state, load) {
      state.loadingInstances = load
    },
    setLoadingJobs (state, load) {
      state.loadingInstances = load
    }
  },
  actions: {
    // user limits
    async getUserLimits ({ state, commit, rootState, rootGetters }) {
      var data
      if (rootGetters.isAdmin) {
        data = await Vue.prototype.$axios.get('/api/resources')
        data = data.data
      } else {
        data = rootState.user
      }

      const resources = state.resources
      resources.cpus.limit = Number(data.cpus)
      resources.memory.limit = Number(data.mem)
      resources.gpus.limit = Number(data.gpus)
      resources.capacity.limit = Number(data.capacity)
      commit('setResources', resources)
    },

    updateUsage ({ state, commit }) {
      // update using resources
      const resources = state.resources
      resources.cpus.using = calcUsage(state, 'cpus')
      resources.memory.using = calcUsage(state, 'memory')
      resources.gpus.using = calcUsage(state, 'gpus')
      resources.capacity.using = calcUsage(state, 'capacity')
      commit('setResources', resources)
    },

    /*
     * Instances
     */
    async getInstances ({ commit, dispatch }) {
      commit('setLoadingInstances', true)

      //  init
      var instances = []

      // get instances
      const { data } = await Vue.prototype.$axios.get('/api/instances')
      // update instances
      data.pods.forEach(element => {
        const { name, status, nodePort, limits, volumes } = element
        const pod = {
          name,
          status,
          port: nodePort,
          cpus: limits.cpu,
          memory: limits.memory.slice(0, -2),
          gpus: limits['nvidia.com/gpu'],
          volumes: []
        }
        volumes.forEach(element => {
          pod.volumes.push(element.persistentVolumeClaim.claimName)
        })
        instances.push(pod)
      })

      commit('setInstances', instances)
      dispatch('updateUsage')
      commit('setLoadingInstances', false)
    },
    async createInstance ({ state, commit, dispatch }, data) {
      await Vue.prototype.$axios.post('/api/instances', data)

      let instances = state.instances
      instances.push({
        name: data.name,
        status: 'Pending',
        port: '',
        cpus: data.cpu_request,
        memory: data.memory_request,
        gpus: data.gpu_request,
        volumes: [data.volume_name]
      })
      commit('setInstances', instances)
      dispatch('updateUsage')
    },
    async deleteInstance ({ state, commit, dispatch }, name) {
      await Vue.prototype.$axios.delete('/api/instances/' + name)

      let instances = state.instances
      instances[instances.findIndex(v => v.name === name)].status = 'Terminating'
      commit('setInstances', instances)
      dispatch('updateUsage')
    },

    /*
     * volumes
     */
    async getVolumes ({ commit, dispatch }) {
      commit('setLoadingVolumes', true)

      // init
      var volumes = []

      // get volumes
      const { data } = await Vue.prototype.$axios.get('/api/volumes')

      data.volumes.forEach(element => {
        const { name, capacity, status } = element // add to status
        const vol = {
          name,
          capacity: capacity.slice(0, -2),
          status
        }
        volumes.push(vol)
      })
      commit('setVolumes', volumes)
      dispatch('updateUsage')
      commit('setLoadingVolumes', false)
    },

    signOut ({ commit }) {
      commit('setToken', null)
      commit('setUser', null)
      localStorage.removeItem('token')
    }
  },
  getters: {
    isLoading (state) {
      return state.loadingInstances || state.loadingVolumes || state.loadingJobs
    }
  }
}

export default resourceStore
