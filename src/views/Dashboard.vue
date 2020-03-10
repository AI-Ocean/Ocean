<template>
  <v-container fluid grid-list-md>
    <!-- Top Indicator Cards -->
    <v-row>
      <v-col md="2">
        <v-card>
          <v-toolbar color="green" flat dark>
            <v-toolbar-title>
              Instances
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ run_instances }} / {{ total_instances }}
          </v-card-title>
        </v-card>
      </v-col>
      <v-col md="2">
        <v-card>
          <v-toolbar color="green" flat dark>
            <v-toolbar-title>
              Volumes
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ total_volumes }}
          </v-card-title>
        </v-card>
      </v-col>
      <v-spacer></v-spacer>
      <v-col md="2">
        <v-card>
          <v-toolbar color="orange" flat dark>
            <v-toolbar-title>
              CPUs
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ cpu_using }} / {{ cpu_limit }}
          </v-card-title>
        </v-card>
      </v-col>
      <v-col md="2">
        <v-card>
          <v-toolbar color="orange" flat dark>
            <v-toolbar-title>
              Memory
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ memory_using }} / {{ memory_limit }} Gi
          </v-card-title>
        </v-card>
      </v-col>
      <v-col md="2">
        <v-card>
          <v-toolbar color="orange" flat dark>
            <v-toolbar-title>
              GPUs
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ gpu_using }} / {{ gpu_limit }}
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <!-- END Top Indicator Cards -->

    <v-row>
      <!-- Instances Table -->
      <v-col md="12">
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
      <v-col md="12">
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
import Instances from '@/components/dashboard/Instances'
import Volumes from '@/components/dashboard/Volumes'

export default {
  components: {
    Instances,
    Volumes
  },
  data: () => ({
    // top status
    cpu_limit: 0,
    memory_limit: 0,
    gpu_limit: 0,
    capacity_limit: 0,

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
    // computed methods
    to_value_list (key) {
      return this.instances.map((item) => {
        return Number(item[key])
      })
    },
    sum (list) {
      return list.reduce((a, b) => {
        return a + b
      }, 0)
    },
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
      // TODO delete
      this.gpu_limit = Number(data.gpus)
      this.cpu_limit = Number(data.cpus)
      this.memory_limit = Number(data.mem)
      // end delete
      this.resources.cpus.limit = Number(data.cpus)
      this.resources.memory.limit = Number(data.mem)
      this.resources.gpus.limit = Number(data.gpus)
      this.resources.capacity.limit = Number(data.capacity)
    },

    /// Instances
    async getInstances () {
      this.loadingInstances = true
      //  init
      this.instances = []

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
        this.instances.push(pod)
      })

      // update using resources
      this.resources.cpus.using = this.calcUsage('cpus')
      this.resources.memory.using = this.calcUsage('memory')
      this.resources.gpus.using = this.calcUsage('gpus')

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
    total_instances () {
      return this.instances.length
    },
    run_instances () {
      return this.instances.filter((item) => {
        return item.status === 'Running'
      }).length
    },
    total_volumes () {
      return this.volumes.length
    },

    cpu_using () {
      return this.sum(this.to_value_list('cpus'))
    },
    memory_using () {
      return this.sum(this.to_value_list('memory'))
    },
    gpu_using () {
      return this.sum(this.to_value_list('gpus'))
    },
    capacity_using () {
      return 0
      // TODO
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
