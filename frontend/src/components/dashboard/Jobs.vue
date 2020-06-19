<template>
  <v-card>
    <!-- header -->
    <v-toolbar flat dark>
      <v-toolbar-title>
        Jobs
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="dialog=true">
        <v-icon color="white">mdi-plus-box</v-icon>
      </v-btn>

      <!-- form dialog -->
      <v-dialog
        v-model="dialog"
        max-width="500"
      >
        <v-card>
          <v-card-title>
            New job
          </v-card-title>
          <v-card-text>
            <v-form
              ma-4
              ref="form"
              v-model="valid"
            >
              <v-text-field
                v-model.trim="name"
                counter="30"
                :rules="name_rules"
                label="Name"
                :prefix="$store.getters.namePrefix"
                required
              >
              </v-text-field>
              <v-select
                v-model="jobType"
                :items="jobsList"
                label="job Type"
                auto
                required
                @change="setJobType()"
              ></v-select>
              <v-text-field
                v-model.number="cpus"
                type="number"
                :rules="cpu_rules"
                label="CPUs"
                required
                :disabled="isDisabled"
              ></v-text-field>
              <v-text-field
                v-model.number="memory"
                type="number"
                :rules="memory_rules"
                label="Memory"
                required
                :disabled="isDisabled"
              ></v-text-field>
              <v-text-field
                v-model.number="gpus"
                :rules="gpu_rules"
                type="number"
                label="GPUs"
                required
                :suffix="' / ' + remainResources('gpus')"
                :readonly="isDisabled"
              ></v-text-field>
              <v-select
                v-model="gpuType"
                :items="gpuTypeList"
                label="GPU Type"
                :rules="required_rules"
                required
              ></v-select>
              <v-select
                v-model="volume"
                :items="volumes"
                label="Volumes"
                :rules="required_rules"
                required
                chips
              ></v-select>
              <v-text-field
                v-model="command"
                :rules="command_rules"
                type="string"
                label="Command"
                required
                hint="Shell Command to Run"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="gray" @click="onCancle">
              Cancle
            </v-btn>
            <v-btn color="success" @click="onCreate" :disabled="!valid">
              Create
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- end form dialog -->
    </v-toolbar>
    <!-- end header -->

    <!-- data table -->
    <v-data-table
      :headers="jobsHeader"
      :items="jobs"
      :loading="loading"
      :options.sync="options"
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
        <v-btn icon @click="openDeleteDialog(item.name)">
          <v-icon>
            mdi-trash-can
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <!-- end data table -->

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>
          Delete Jobs
        </v-card-title>
        <v-card-text>
          Are you sure to delete <code> {{ targetName }} </code>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color='red' @click="onDelete(targetName)">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<script>
export default {
  name: 'Jobs',
  props: {
    resources: {
      type: Object
    },
    jobs: {
      type: Array
    },
    volumes: {
      type: Array
    },
    loading: {
      type: Boolean
    }
  },
  data: () => ({
    // jobs
    jobsHeader: [
      { text: 'Status', value: 'status', width: 80, sortable: false, filterable: false },
      { text: 'Name', value: 'name', width: 200, sortable: false, filterable: false },
      { text: 'CPUs', value: 'cpus', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'Memory', value: 'memory', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'GPUs', value: 'gpus', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'Volumes', value: 'volumes', width: 400, sortable: false, filterable: false },
      { text: 'Command', value: 'command', sortable: false, filterable: false },
      { text: '', value: 'delete', width: 70, sortable: false, filterable: false }
    ],

    jobsList: [
      { text: 'g2', value: { name: 'g2', cpus: 8, memory: 32, gpus: 2 } },
      { text: 'g4', value: { name: 'g4', cpus: 16, memory: 64, gpus: 4 } }
    ],

    gpuTypeList: [
      { text: 'GTX-1080ti', value: { name: 'nvidia-gtx-1080ti' } },
      { text: 'RTX-2080ti', value: { name: 'nvidia-rtx-2080ti' } }
    ],

    options: {
      itemsPerPage: 20
    },

    // form
    dialog: false,
    valid: false,

    name: undefined,
    jobType: undefined,
    cpus: undefined,
    memory: undefined,
    gpus: undefined,
    gpuType: 'nvidia-rtx-2080ti',
    volume: undefined,
    command: undefined,

    // data table
    deleteDialog: false,
    targetName: ''
  }),
  methods: {
    // stataus icon
    getStatusIcon (status) {
      if (status === 'Running') return 'mdi-check-circle'
      else if (status === 'Pending') return 'mdi-loading'
      else return 'mdi-alert-circle'
    },

    remainResources (type) {
      return (this.resources[type].limit - this.resources[type].using)
    },

    setJobType () {
      this.cpus = this.jobType.cpus
      this.memory = this.jobType.memory
      this.gpus = this.jobType.gpus
    },

    openDeleteDialog (name) {
      this.deleteDialog = true
      this.targetName = name
    },

    onGet () {
      this.$emit('get')
    },
    onCreate () {
      // request create pods
      this.$emit('create', {
        name: this.$store.getters.namePrefix + this.name,
        cpu_request: this.cpus,
        memory_request: this.memory,
        gpu_request: this.gpus,
        gpu_type: this.gpuType,
        volume_name: this.volume,
        command: this.command.split(' ')
      })

      // reset dialog
      this.dialog = false
      this.$refs.form.resetValidation()
      this.$refs.form.reset()
    },
    onCancle () {
      this.$emit('cancle')

      // reset dialog
      this.dialog = false
      this.$refs.form.resetValidation()
      this.$refs.form.reset()
    },
    onDelete (name) {
      this.deleteDialog = false
      this.$emit('delete', name)
    }
  },
  computed: {
    isDisabled () {
      return !this.jobType || (this.jobType && this.jobType.name !== 'custom')
    },
    // rule
    name_rules () {
      return [
        v => (v && v.length >= 1) || 'Name is required',
        v => (v && v.length <= 30) || 'Name must be less then 30 characters',
        v => /^[a-z0-9]([-a-z0-9]*[a-z0-9])$/.test(this.$store.getters.namePrefix + v) || 'Name only can containing lowercase alphabet, number and -',
        v => !this.jobs.map(v => v.name).includes(this.$store.getters.namePrefix + v) || 'Name already exist'
      ]
    },
    cpu_rules () {
      return [
        v => !!v || 'CPUs is required'
      ]
    },
    memory_rules () {
      return [
        v => !!v || 'Memory is required'
      ]
    },
    gpu_rules () {
      return [
        // v => !!v || 'GPUs is required',
        v => v <= this.remainResources('gpus') ||
          `GPUs must be less then ${this.remainResources('gpus')} limit`
      ]
    },
    command_rules () {
      return [
        v => !!v || 'Command is required'
      ]
    },
    required_rules () {
      return [
        v => !!v || 'Required item.'
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
