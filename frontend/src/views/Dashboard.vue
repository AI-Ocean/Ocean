<template>
  <v-container fluid grid-list-md class="ma-0 pa-0">
    <!-- Top Indicator Cards -->
    <v-row class="ma-0 pa-0">
      <v-col class="ma-0 pa-0">
        <indicator
          class="ma-0 pa-0"
          :instances="instances"
          :volumes="volumes"
          :resources="resources"
        ></indicator>
      </v-col>
    </v-row>
    <!-- END Top Indicator Cards -->

    <!-- Job Table -->
    <v-row class="ma-0 pa-0">
      <v-col class="ma-0 pa-1 pt-0">
        <jobs
          :loading="loadingJobs"
          :resources="resources"
          :jobs="jobs"
          :volumes="volumes.map(v => v.name)"
          @get="getJobs"
          @create="createJob"
          @delete="deleteJob"
        ></jobs>
      </v-col>
    </v-row>
    <!-- End Job Table -->

    <v-row class="ma-0 pa-0">
      <!-- Instances Table -->
      <v-col class="ma-0 pa-1 pt-0" md="12" lg="8">
        <instances
          :loading="loadingInstances"
          :resources="resources"
          :instances="instances"
          :volumes="volumes.map(v => v.name)"
          @get="getInstances"
          @create="createInstance"
          @delete="deleteInstance"
        ></instances>
      </v-col>
      <!-- END Instances Table -->

      <!-- Volumes Table -->
      <v-col class="ma-0 pa-1 pt-0 pl-0" md="12" lg="4">
        <volumes
          :loading="loadingVolumes"
          :resources="resources"
          :volumes="volumes"
          :usedVolumes="usedVolumes"
          @get="getVolumes"
          @create="createVolume"
          @delete="deleteVolume"
        ></volumes>
      <!-- END Volumnes Table -->
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
// import api from '@/api'
import Indicator from '@/components/dashboard/Indicator'
import Instances from '@/components/dashboard/Instances'
import Volumes from '@/components/dashboard/Volumes'
import Jobs from '@/components/dashboard/Jobs'

export default {
  components: {
    Indicator,
    Instances,
    Volumes,
    Jobs
  },
  data: () => ({
    resources: {
      cpus: { using: 0, limit: 0 },
      memory: { using: 0, limit: 0 },
      gpus: { using: 0, limit: 0 },
      capacity: { using: 0, limit: 0 }
    },

    // instances
    instances: [],
    loadingInstances: false,

    // volumes
    volumes: [],
    loadingVolumes: false,

    // jobs
    jobs: [],
    loadingJobs: false
  }),
  created () {
    this.getUserLimits()

    this.getInstances()
    this.getVolumes()
    this.getJobs()

    setInterval(() => {
      this.getInstances()
      this.getVolumes()
      this.getJobs()
    }, 30000)
  },
  methods: {
    calcUsage (type) {
      let base
      if (type === 'capacity') {
        base = this.volumes
      } else {
        if (this.$store.getters.isAdmin) {
          base = this.instances
        } else {
          base = this.instances.concat(this.jobs)
        }
        base = base.filter(v => v.status === 'Running' || v.status === 'Pending')
      }
      return base
        .map(v => Number(v[type]))
        .reduce((a, b) => a + b, 0)
    },
    updateUsage () {
      // update using resources
      this.resources.cpus.using = this.calcUsage('cpus')
      this.resources.memory.using = this.calcUsage('memory')
      this.resources.gpus.using = this.calcUsage('gpus')
      // update using resources
      this.resources.capacity.using = this.calcUsage('capacity')
    },

    // user limits
    async getUserLimits () {
      var data
      if (this.$store.getters.isAdmin) {
        data = await this.$axios.get('/api/resources')
      } else {
        data = await this.$axios.get('/api/users/' + this.$store.state.user.uid)
      }
      data = data.data
      this.resources.cpus.limit = Number(data.cpus)
      this.resources.memory.limit = Number(data.mem)
      this.resources.gpus.limit = Number(data.gpus)
      this.resources.capacity.limit = Number(data.capacity)
    },

    /// Instances
    async getInstances () {
      this.loadingInstances = true
      //  init
      var newInstances = []

      // get instances
      const { data } = await this.$axios.get('/api/instances')

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
        newInstances.push(pod)
      })

      this.instances = newInstances

      this.updateUsage()

      this.loadingInstances = false
    },
    async createInstance (data) {
      this.instances.push({
        name: data.name,
        status: 'Pending',
        port: 0,
        cpus: data.cpu_request,
        memory: data.memory_request,
        gpus: data.gpu_request,
        volumes: [data.volume_name]
      })
      this.updateUsage()
      await this.$axios.post('/api/instances', data)
    },
    async deleteInstance (name) {
      this.instances[this.instances.findIndex(v => v.name === name)].status = 'Pending'
      this.updateUsage()
      await this.$axios.delete('/api/instances/' + name)
    },

    /// Jobs
    async getJobs () {
      this.loadingJobs = true
      //  init
      var newJobs = []

      // get instances
      const { data } = await this.$axios.get('/api/jobs')
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

      this.jobs = newJobs

      this.updateUsage()

      this.loadingJobs = false
    },
    async createJob (data) {
      this.jobs.push({
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
      this.updateUsage()
      await this.$axios.post('/api/jobs', data)
    },
    async deleteJob (name) {
      this.jobs[this.jobs.findIndex(v => v.name === name)].status = 'Pending'
      this.updateUsage()
      await this.$axios.delete('/api/jobs/' + name)
    },

    /// Volumes
    async getVolumes () {
      this.loadingVolumes = true
      // init
      var newVolumes = []

      // get volumes
      const { data } = await this.$axios.get('/api/volumes')

      data.volumes.forEach(element => {
        const { name, capacity, status } = element // add to status
        const vol = {
          name,
          capacity: capacity.slice(0, -2),
          status
        }
        newVolumes.push(vol)
      })
      this.volumes = newVolumes

      this.updateUsage()

      this.loadingVolumes = false
    },
    async createVolume (data) {
      this.volumes.push({
        name: data.name,
        capacity: data.storage_request,
        status: 'Pending'
      })
      this.updateUsage()
      await this.$axios.post('/api/volumes/', data)
    },
    async deleteVolume (name) {
      this.volumes[this.volumes.findIndex(v => v.name === name)].status = 'Terminating'
      this.updateUsage()
      await this.$axios.delete('/api/volumes/' + name)
    }
  },
  computed: {
    items () {
      return [
        { text: this.instances.filter(v => v.status === 'Running').length + ' / ' + this.instances.length },
        { text: this.volumes.length },
        { text: this.getText('cpus') },
        { text: this.getText('memory') + ' Gi' },
        { text: this.getText('gpus') },
        { text: this.getText('capacity') + ' Gi' }
      ]
    },
    usedVolumes () {
      var set = new Set()
      this.instances.map(v => v.volumes.forEach(v => set.add(v)))
      return set
    }
  }
}
</script>

<style scoped>
.Running {
  color: green;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.Pending {
  animation-name: spin;
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.Failed {
  color: red;
}

.highlight {
  color: pink;
  background-color: gray;
}
</style>
