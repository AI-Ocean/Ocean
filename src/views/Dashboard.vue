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
      <v-col lg="6" md="12">
        <v-card>
          <v-toolbar color="blue" flat dark>
            <v-toolbar-title>
              Instances
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="getInstances()">
              <v-icon color="white">mdi-refresh</v-icon>
            </v-btn>
            <v-btn icon @click="dialog_new_instance = true">
              <v-icon color="white">mdi-plus-box</v-icon>
            </v-btn>
            <v-dialog
              v-model="dialog_new_instance"
              max-width="500"
            >
              <instances-form
                :cpu_limit="this.cpu_limit"
                :cpu_using="this.cpu_using"
                :memory_limit="this.memory_limit"
                :memory_using="this.memory_using"
                :gpu_limit="this.gpu_limit"
                :gpu_using="this.gpu_using"
                :volumes="this.volumes.map(x=>x.name)"
                @create="createInstanceForm"
                @cancle="cancleInstanceForm"
              >
              </instances-form>
            </v-dialog>
          </v-toolbar>

          <v-data-table
            :headers="instancesHeader"
            :items="instances"
            :loading="loadingInstances"
            hide-default-footer
          >
            <template v-slot:item.status="{ item }">
              <v-icon :class="item.status" :alt="item.status">{{ getStatusIcon(item.status) }}</v-icon>
            </template>
            <template v-slot:item.memory="{ item }">
              {{ item.memory }} Gi
            </template>
            <template v-slot:item.volumes="{ item }">
              <v-chip class="ma-1" v-for="v in item.volumes" :key="v">{{ v }}</v-chip>
            </template>
            <template v-slot:item.delete="{ item }">
              <v-btn icon @click="deleteInstance(item.name)">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <!-- END Instances Table -->

      <!-- Volumes Table -->
      <v-col lg="6" md="12">
        <v-card>
          <v-toolbar color="blue" flat dark>
              <v-toolbar-title>
              Volumes
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="getVolumes()">
              <v-icon color="white">mdi-refresh</v-icon>
            </v-btn>
            <v-btn icon @click="dialog_new_volume = true">
              <v-icon color="white">mdi-plus-box</v-icon>
            </v-btn>
            <v-dialog
              v-model="dialog_new_volume"
              max-width="500"
            >
              <volumes-form
                :gpu_limit="this.gpu_limit"
                :gpu_using="this.gpu_using"
                :capacity_limit="this.capacity_limit"
                :capacity_using="this.capacity_using"
                @create="createVolumeForm"
                @cancle="cancleVolumeForm"
              >
              </volumes-form>
            </v-dialog>
          </v-toolbar>
          <v-data-table
            :headers="volumesHeader"
            :items="volumes"
            :loading="loadingVolumes"
            hide-default-footer
          >
            <template v-slot:item.delete="{ item }">
              <v-btn icon @click="deleteVolume(item.name)">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      <!-- END Volumnes Table -->

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import InstancesForm from '@/components/dashboard/InstancesForm'
import VolumesForm from '@/components/dashboard/VolumesForm'

export default {
  components: {
    InstancesForm,
    VolumesForm
  },
  data: () => ({
    // top status
    cpu_limit: 0,
    memory_limit: 0,
    gpu_limit: 0,
    capacity_limit: 50, // TODO

    // instances
    instancesHeader: [
      { text: 'Status', value: 'status', width: 80, sortable: false, filterable: false },
      { text: 'Name', value: 'name', width: 200, sortable: false, filterable: false },
      { text: 'CPUs', value: 'cpus', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'Memory', value: 'memory', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'GPUs', value: 'gpus', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'SSH port', value: 'port', sortable: false, filterable: false },
      { text: 'Volumes', value: 'volumes', sortable: false, filterable: false },
      { text: '', value: 'delete', width: 70, sortable: false, filterable: false }
    ],
    instances: [],

    // volumes
    volumesHeader: [
      { text: 'Name', value: 'name', sortable: false, filterable: false },
      { text: 'Capacity', value: 'capacity', sortable: false, filterable: false },
      { text: 'Status', value: 'status', sortable: false, filterable: false },
      { text: '', value: 'delete', width: 70, sortable: false, filterable: false }
    ],
    volumes: [],

    // dialog switch
    dialog_new_instance: false,
    dialog_new_volume: false,

    loadingInstances: false,
    loadingVolumes: false

  }),
  mounted () {
    this.getUserLimits()
    this.getInstances()
    this.getVolumes()
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

    // stataus icon
    getStatusIcon (status) {
      if (status === 'Running') return 'mdi-check-circle'
      else if (status === 'Pending') return 'mdi-loading'
      else return 'mdi-alert-circle'
    },

    // user limits
    async getUserLimits () {
      const { data } = await this.$axios.get('/profile')
      this.gpu_limit = data.gpus
      this.cpu_limit = data.cpus
      this.memory_limit = data.mem
    },

    // get
    async getInstances () {
      // loading
      this.loadingInstances = true
      //  init
      this.instances = []

      // get instances
      const { data } = await this.$axios.get('/api/instances')

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

      // end loading
      this.loadingInstances = false
    },
    async getVolumes () {
      // loading
      this.loadingVolumes = true
      // init
      this.volumes = []

      // get volumes
      const { data } = await this.$axios.get('/api/volumes')

      data.volumes.forEach(element => {
        const { name, capacity, status } = element // add to status
        const vol = {
          name,
          capacity,
          status
        }
        this.volumes.push(vol)
      })

      // loading end
      this.loadingVolumes = false
    },

    cancleInstanceForm () {
      this.dialog_new_instance = false
    },
    async createInstanceForm (data) {
      this.dialog_new_instance = false

      // request create pods
      const requestData = {
        name: data.name,
        cpu_request: data.cpus,
        memory_request: data.memory,
        gpu_request: data.gpus,
        volume_name: data.volume
      }
      await this.$axios.post('/api/instances', requestData)
      // refresh
      this.getInstances()
    },
    cancleVolumeForm () {
      this.dialog_new_volume = false
    },
    async createVolumeForm (data) {
      this.dialog_new_volume = false

      // request create pods
      const requestData = {
        name: data.name,
        storage_request: data.capacity
      }
      await this.$axios.post('/api/volumes/', requestData)
      // refresh
      this.getVolumes()
    },
    async deleteInstance (name) {
      await this.$axios.delete('/api/instances/' + name)
      this.getInstances()
    },
    async deleteVolume (name) {
      await this.$axios.delete('/api/volumes/' + name)
      this.getVolumes()
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
      // return this.sum(this.to_value_list())
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
</style>
