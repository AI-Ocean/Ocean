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
                :rules="nameRules"
                label="Name"
                :prefix="namePrefix"
                required
              >
              </v-text-field>
              <v-select
                v-model="jobType"
                :items="jobsList"
                :rules="jobTypeRules"
                label="Job Type"
                auto
                required
                :hint="`CPU: ${jobType.cpus}, Memory: ${jobType.memory}, GPU: ${jobType.gpuType} x ${jobType.gpus}`"
                persistent-hint
              ></v-select>
              <v-select
                v-model="volume"
                :items="volumes"
                label="Volumes"
                :rules="requiredRules"
                required
                chips
              ></v-select>
              <v-text-field
                v-model="command"
                :rules="commandRules"
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
      <template v-slot:[`item.status`]="{ item }">
        <v-icon :class="item.status" :alt="item.status">{{ getStatusIcon(item.status) }}</v-icon>
      </template>
      <template v-slot:[`item.memory`]="{ item }">
        {{ item.memory }} Gi
      </template>
      <template v-slot:[`item.command`]="{ item }">
        {{ item.command.join(' ') }}
      </template>
      <template v-slot:[`item.volumes`]="{ item }">
        <v-chip class="ma-1" v-for="v in item.volumes" :key="v">{{ v }}</v-chip>
      </template>
      <template v-slot:[`item.duration`]="{ item }">
        {{ calcDuration(item.startTime, item.completionTime) }}
      </template>
      <template v-slot:[`item.age`]="{ item }">
        {{ calcAge(item.startTime) }}
      </template>
      <template v-slot:[`item.logs`]="{ item }">
        <v-btn text @click="viewLogs(item.name)"><v-icon>mdi-open-in-new</v-icon>view logs</v-btn>
      </template>
      <template v-slot:[`item.delete`]="{ item }">
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

    <v-dialog v-model="logDialog" max-width="1500">
      <v-card>
        <v-card-title>
          Job Logs
        </v-card-title>
        <v-card-text>
          <v-textarea
            readonly
            solo
            flat
            rows="30"
            background-color="grey darken-3"
            :loading="podLogsLoading"
            :value="podLogs">
            {{podLogs}}
          </v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="logDialog=false">
            close
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
      { text: 'Status', value: 'status', width: 10, sortable: false, filterable: false },
      { text: 'Name', value: 'name', width: 80, sortable: false, filterable: false },
      { text: 'CPUs', value: 'cpus', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'Memory', value: 'memory', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'GPUs', value: 'gpus', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'Volumes', value: 'volumes', width: 100, sortable: false, filterable: false },
      { text: 'Command', value: 'command', width: 200, sortable: false, filterable: false },
      { text: 'Duration', value: 'duration', width: 50, sortable: false, filterable: false },
      { text: 'Age', value: 'age', width: 50, sortable: false, filterable: false },
      { text: 'Logs', value: 'logs', width: 200, sortable: false, filterable: false },
      { text: '', value: 'delete', width: 10, sortable: false, filterable: false }
    ],

    jobsList: [
      { text: 'g2.small', value: { name: 'g2.small', cpus: 4, memory: 16, gpus: 1, gpuType: 'nvidia-rtx-2080ti' } },
      { text: 'g2.medium', value: { name: 'g2.medium', cpus: 8, memory: 32, gpus: 2, gpuType: 'nvidia-rtx-2080ti' } },
      { text: 'g2.large', value: { name: 'g2.large', cpus: 16, memory: 64, gpus: 4, gpuType: 'nvidia-rtx-2080ti' } }
    ],

    options: {
      itemsPerPage: 20
    },

    // form
    dialog: false,
    valid: false,
    name: undefined,
    jobType: undefined,
    volume: undefined,
    command: undefined,

    // data table
    deleteDialog: false,
    targetName: '',
    logDialog: false,
    podLogs: 'No Logs',
    podLogsLoading: false
  }),
  created () {
    this.jobType = { name: 'g2.small', cpus: 4, memory: 16, gpus: 1, gpuType: 'nvidia-rtx-2080ti' }
    this.volume = this.volumes[0]
  },
  methods: {
    // stataus icon
    getStatusIcon (status) {
      if (status === 'Succeeded') return 'mdi-check-decagram'
      else if (status === 'Running' || status === 'Pending' || status === 'Terminating') return 'mdi-loading'
      else return 'mdi-alert-circle'
    },

    remainResources (type) {
      return (this.resources[type].limit - this.resources[type].using)
    },

    openDeleteDialog (name) {
      this.deleteDialog = true
      this.targetName = name
    },

    resetDialog () {
      this.dialog = false
      this.$refs.form.resetValidation()
      this.$refs.form.reset()
      this.jobType = { name: 'g2.small', cpus: 4, memory: 16, gpus: 1, gpuType: 'nvidia-rtx-2080ti' }
      this.volume = this.volumes[0]
    },

    onGet () {
      this.$emit('get')
      this.volume = this.volumes[0]
    },

    onCreate () {
      // request create pods
      this.$emit('create', {
        name: this.namePrefix + this.name,
        cpu_request: this.jobType.cpus,
        memory_request: this.jobType.memory,
        gpu_request: this.jobType.gpus,
        gpu_type: this.jobType.gpuType,
        volume_name: this.volume,
        command: this.command.split(' '),
        lastEvent: ''
      })
      this.resetDialog()
    },

    onCancle () {
      this.$emit('cancle')
      this.resetDialog()
    },

    onDelete (name) {
      this.deleteDialog = false
      this.$emit('delete', name)
    },

    async viewLogs (name) {
      this.podLogs = 'No Logs'
      this.logDialog = true
      this.podLogsLoading = true
      const { data } = await this.$axios.get('/api/jobs/' + name + '/log')
      this.podLogs = data.logs
      this.podLogsLoading = false
    },

    // calculate duration
    calcDuration (start, end) {
      start = new Date(start)
      end = end ? new Date(end) : new Date()
      const diff = new Date(end - start)

      let result = ''
      result += diff.getUTCDate() > 1 ? (Number(diff.getUTCDate()) - 1) + 'd' : ''
      result += diff.getUTCHours() > 0 ? diff.getUTCHours() + 'h' : ''
      result += diff.getUTCMinutes() + 'm'
      return result
    },

    // calculate age
    calcAge (start) {
      start = new Date(start)
      const end = new Date()
      const diff = new Date(end - start)

      let result = ''
      result += diff.getUTCDate() > 1 ? (Number(diff.getUTCDate()) - 1) + 'd' : ''
      result += diff.getUTCHours() > 0 ? diff.getUTCHours() + 'h' : ''
      result += diff.getUTCMinutes() + 'm'
      return result
    }
  },
  computed: {
    // namePrefix
    namePrefix () {
      return 'jobs-' + this.$store.getters.namePrefix
    },
    // rule
    nameRules () {
      return [
        v => (v && v.length >= 1) || 'Name is required',
        v => (v && v.length <= 30) || 'Name must be less then 30 characters',
        v => /^[a-z0-9]([-a-z0-9]*[a-z0-9])$/.test(this.$store.getters.namePrefix + v) || 'Name only can containing lowercase alphabet, number and -',
        v => !this.jobs.map(v => v.name).includes(this.namePrefix + v) || 'Name already exist'
      ]
    },
    jobTypeRules () {
      return [
        v => !!v || 'Job Type is required',
        v => (v.gpus <= this.remainResources('gpus') || this.$store.state.claims.level === 0) ||
          `GPUs must be less then ${this.remainResources('gpus')} limit`
      ]
    },
    commandRules () {
      return [
        v => !!v || 'Command is required'
      ]
    },
    requiredRules () {
      return [
        v => !!v || 'Required item.'
      ]
    }
  }
}
</script>

<style scoped>
.Succeeded {
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
.Running {
  color: green;
  animation-name: spin;
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.Failed {
  color: red;
}
</style>
