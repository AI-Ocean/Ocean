<template>
  <v-container fluid grid-list-md>
    <!-- Top Indicator Cards -->
    <v-row>
      <indicator
        :instances="instances"
        :volumes="volumes"
        :resources="resources"
      ></indicator>
    </v-row>
    <!-- END Top Indicator Cards -->

    <v-row>
      <!-- Instances Table -->
      <v-col md="12" lg="8">
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
      <v-col md="12" lg="4">
        <volumes
          :loading="loadingVolumes"
          :resources="resources"
          :volumes="volumes"
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

export default {
  components: {
    Indicator,
    Instances,
    Volumes
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
    loadingVolumes: false
  }),
  mounted () {
    this.getUserLimits()
  },
  methods: {
    calcUsage (type) {
      let base = this.instances
      if (type === 'capacity') base = this.volumes
      return base
        .map(v => Number(v[type]))
        .reduce((a, b) => a + b, 0)
    },

    // user limits
    async getUserLimits () {
      const { data } = await this.$axios.get('/profile')

      this.resources.cpus.limit = Number(data.cpus)
      this.resources.memory.limit = Number(data.mem)
      this.resources.gpus.limit = Number(data.gpus)
      this.resources.capacity.limit = Number(data.capacity)

      // this.updateItems()
    },

    /// Instances
    async getInstances () {
      this.loadingInstances = true
      //  init
      this.instances = []

      // get instances
      const { data } = await this.$axios.get('/api/instances')
      // const data = await api.getInstances()

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
        this.instances.push(pod)
      })

      // update using resources
      this.resources.cpus.using = this.calcUsage('cpus')
      this.resources.memory.using = this.calcUsage('memory')
      this.resources.gpus.using = this.calcUsage('gpus')

      // this.updateItems()

      this.loadingInstances = false
    },
    async createInstance (data) {
      await this.$axios.post('/api/instances', data)
    },
    async deleteInstance (name) {
      await this.$axios.delete('/api/instances/' + name)
    },

    /// Volumes
    async getVolumes () {
      this.loadingVolumes = true
      // init
      this.volumes = []

      // get volumes
      const { data } = await this.$axios.get('/api/volumes')

      data.volumes.forEach(element => {
        const { name, capacity, status } = element // add to status
        const vol = {
          name,
          capacity: capacity.slice(0, -2),
          status
        }
        this.volumes.push(vol)
      })
      // update using resources
      this.resources.capacity.using = this.calcUsage('capacity')

      // this.updateItems()

      this.loadingVolumes = false
    },
    async createVolume (data) {
      await this.$axios.post('/api/volumes/', data)
    },
    async deleteVolume (name) {
      await this.$axios.delete('/api/volumes/' + name)
    }
  },
  computed: {
    // top
    items () {
      return [
        { text: this.instances.filter(v => v.status === 'Running').length + ' / ' + this.instances.length },
        { text: this.volumes.length },
        { text: this.getText('cpus') },
        { text: this.getText('memory') + ' Gi' },
        { text: this.getText('gpus') },
        { text: this.getText('capacity') + ' Gi' }
      ]
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
