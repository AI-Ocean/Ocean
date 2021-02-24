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
    async createVolume ({ state, commit, dispatch }, data) {
      console.log(data)
      await Vue.prototype.$axios.post('/api/volumes', data)
      let volumes = state.volumes
      volumes.push({
        name: data.name,
        capacity: data.capacity,
        status: 'Pending'
      })
      commit('setVolumes', volumes)
      dispatch('updateUsage')
    },
    async deleteVolume ({ state, commit, dispatch }, name) {
      await Vue.prototype.$axios.delete('/api/volumes/' + name)

      let volumes = state.volumes
      volumes[volumes.findIndex(v => v.name === name)].status = 'Terminating'
      commit('setVolumes', volumes)
      dispatch('updateUsage')
    },

    /*
     * Jobs
     */
    async getJobs ({ commit, dispatch }) {
      commit('setLoadingJobs', true)

      //  init
      var newJobs = []

      // get instances
      const { data } = await Vue.prototype.$axios.get('/api/jobs')
      // update instances
      data.jobs.forEach(element => {
        const { name, status, limits, volumes, command, startTime, completionTime } = element
        const job = {
          name,
          status,
          cpus: limits.cpu,
          memory: limits.memory.slice(0, -2),
          gpus: limits['nvidia.com/gpu'],
          volumes: [],
          command,
          startTime,
          completionTime
        }
        volumes.forEach(element => {
          job.volumes.push(element.persistentVolumeClaim.claimName)
        })
        newJobs.push(job)
      })

      commit('setJobs', newJobs)
      dispatch('updateUsage')
      commit('setLoadingJobs', false)
    },
    async createJob ({ state, commit, dispatch }, data) {
      await Vue.prototype.$axios.post('/api/jobs', data)
      let jobs = state.jobs
      jobs.push({
        name: data.name,
        status: 'Pending',
        cpus: data.cpu_request,
        memory: data.memory_request,
        gpus: data.gpu_request,
        volumes: [data.volume_name],
        command: data.command,
        startTime: new Date(),
        completionTime: new Date()
      })
      commit('setJobs', jobs)
      dispatch('updateUsage')
    },
    async deleteJob ({ state, commit, dispatch }, name) {
      await Vue.prototype.$axios.delete('/api/jobs/' + name)
      let jobs = state.jobs
      jobs[jobs.findIndex(v => v.name === name)].status = 'Terminating'
      commit('setJobs', jobs)
      dispatch('updateUsage')
    }
  },

  getters: {
    isLoading (state) {
      return state.loadingInstances || state.loadingVolumes || state.loadingJobs
    },
    remainResources (state) {
      return function (type) {
        return state.resources[type].limit - state.resources[type].using
      }
    }

  }
}

export default resourceStore
