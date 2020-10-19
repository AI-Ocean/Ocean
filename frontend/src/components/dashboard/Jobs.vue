<template>
  <v-card tile>
    <!-- header -->
    <v-toolbar flat dark>
      <v-toolbar-title>
        Jobs
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="openDialog">
        <v-icon color="white">mdi-plus-box</v-icon>
      </v-btn>
      <v-divider class="mx-2" vertical></v-divider>
      <v-btn icon @click="openCopyDialog" :disabled="selected.length !== 1">
        <v-icon color="white">mdi-content-copy</v-icon>
      </v-btn>
      <v-divider class="mx-2" vertical></v-divider>
      <v-btn icon @click="openDeleteDialog" :disabled="selected.length < 1">
        <v-icon color="white">mdi-trash-can</v-icon>
      </v-btn>
    </v-toolbar>
    <!-- end header -->

    <!-- data table -->
    <v-data-table
      v-model="selected"
      hide-default-footer
      show-select
      item-key="name"
      :headers="jobsHeader"
      :items="jobs"
      :loading="loading"
      :options.sync="options"
    >
      <template v-slot:[`item.status`]="{ item }">
        <v-icon :class="item.status" :alt="item.status">{{ getStatusIcon(item.status) }}</v-icon>
      </template>
      <template v-slot:[`item.gpus`]="{ item }">
        {{ convertGpuToJobType(Number(item.gpus)) }}
      </template>
      <template v-slot:[`item.command`]="{ item }">
        {{ item.command.join(' ') }}
      </template>
      <template v-slot:[`item.volumes`]="{ item }">
        <v-chip class="ma-1" v-for="v in item.volumes" :key="v">{{ v }}</v-chip>
      </template>
      <template v-slot:[`item.duration`]="{ item }">
        {{ calcTime(item.startTime, item.completionTime) }}
      </template>
      <template v-slot:[`item.age`]="{ item }">
        {{ calcTime(item.startTime) }}
      </template>
      <template v-slot:[`item.logs`]="{ item }">
        <v-btn text @click="viewLogs(item.name)"><v-icon>mdi-open-in-new</v-icon>view logs</v-btn>
      </template>
    </v-data-table>
    <!-- end data table -->

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
            ></v-text-field>
            <span v-if="repeat <= 5">Names:
              <span v-for="(item) in candinateNames(name)" :key="item"><code>{{ item }}</code>{{' '}}</span>
            </span>
            <v-row>
              <v-col cols=8>
                <v-select
                  v-model="jobType"
                  :items="jobsList"
                  :rules="jobTypeRules"
                  label="Job Type"
                  auto
                  la
                  required
                  :hint="jobTypeHint"
                  persistent-hint
                  :error-messages="gpuErrorMessages"
                  ref="jobType"
                ></v-select>
              </v-col>
              <v-col cols=1>
              </v-col>
              <v-col cols=3>
                <v-text-field
                  v-model.number="repeat"
                  type="number"
                  :rules="repeatRules"
                  label="Repeat"
                  @click:append-outer="increment"
                  @click:prepend="decrement"
                  required
                  :error-messages="gpuErrorMessages"
                  ref="repeat"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-select
              v-model="volume"
              :items="volumes"
              label="Volumes"
              :rules="requiredRules"
              required
              chips
            ></v-select>
            <v-text-field
              v-model.trim="command"
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

    <!-- delete dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>
          Delete Jobs
        </v-card-title>
        <v-card-text>
          Are you sure to delete <code> {{ selected.map(x => x.name).join(',') }} </code>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color='red' @click="onDelete()">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- end delete dialog -->

    <!-- log dialog -->
    <v-dialog tile v-model="logDialog" max-width="1500" overlay-opacity=100>
      <v-card>
        <v-card-title>
          Job Logs
          <v-spacer></v-spacer>
          <v-switch
            v-model="logReverse"
            label="Reverse"
          ></v-switch>
        </v-card-title>
        <v-card-text>
          <v-textarea
            readonly
            solo
            flat
            hide-details
            rows="20"
            background-color="grey darken-3"
            :loading="podLogsLoading"
            :value="reverseText(podLogs, logReverse)">
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
    <!-- end log dialog -->

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
      { text: 'Type', value: 'gpus', width: 10, align: 'end', sortable: false, filterable: false },
      { text: 'Volumes', value: 'volumes', width: 100, sortable: false, filterable: false },
      { text: 'Command', value: 'command', width: 200, sortable: false, filterable: false },
      { text: 'Duration', value: 'duration', width: 20, sortable: false, filterable: false },
      { text: 'Age', value: 'age', width: 20, sortable: false, filterable: false },
      { text: 'Logs', value: 'logs', width: 100, sortable: false, filterable: false }
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
    name: '',
    repeat: 1,
    jobType: { name: 'g2.small', cpus: 4, memory: 16, gpus: 1, gpuType: 'nvidia-rtx-2080ti' },
    volume: undefined,
    command: '',
    gpuErrorMessages: '',

    // data table
    selected: [],
    deleteDialog: false,
    targetName: '',
    logDialog: false,
    logReverse: false,
    podLogs: 'No Logs.',
    podLogsLoading: false
  }),
  created () {
    this.jobType = this.jobsList[0].value
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

    // reverse text
    reverseText (text, reverse = false) {
      if (reverse) {
        text = text.split('\n').reverse().join('\n')
      }
      return text
    },

    // dialog repeat
    increment () {
      this.repeat = parseInt(this.repeat) + 1
    },
    decrement () {
      this.repeat = parseInt(this.repeat) - 1
    },

    openDeleteDialog () {
      this.deleteDialog = true
    },

    openDialog () {
      this.dialog = true
      this.volume = this.volumes[0]
    },

    openCopyDialog () {
      this.name = this.selected[0].name.split('-').slice(2, -1).join('-')
      this.volume = this.selected[0].volumes[0]
      this.command = this.selected[0].command.join(' ')

      if (this.selected[0].gpus === 1) {
        this.jobType = this.jobsList[0].value
      } else if (this.selected[0].gpus === 2) {
        this.jobType = this.jobsList[1].value
      } else if (this.selected[0].gpus === 4) {
        this.jobType = this.jobsList[2].value
      }
      this.dialog = true
    },

    resetDialog () {
      this.dialog = false
      this.$refs.form.resetValidation()

      this.name = ''
      this.jobType = this.jobsList[0].value
      this.repeat = 1
      this.volume = this.volumes[0]
      this.command = ''
    },

    onGet () {
      this.$emit('get')
      this.volume = this.volumes[0]
    },

    onCreate () {
      // request create pods
      let name = this.namePrefix + this.name
      let body = {
        cpu_request: this.jobType.cpus,
        memory_request: this.jobType.memory,
        gpu_request: this.jobType.gpus,
        gpu_type: this.jobType.gpuType,
        volume_name: this.volume,
        command: this.command.split(' ')
      }

      this.candinateNames(name).forEach(n => {
        body.name = n
        this.$emit('create', { ...body })
      })
      this.resetDialog()
    },

    onCancle () {
      this.$emit('cancle')
      this.resetDialog()
    },

    onDelete () {
      this.deleteDialog = false
      this.selected.forEach(e => this.$emit('delete', e.name))
      this.selected = []
      // this.$emit('delete', name)
    },

    async viewLogs (name) {
      this.podLogs = 'No Logs.'
      this.logDialog = true
      this.podLogsLoading = true
      const { data } = await this.$axios.get('/api/jobs/' + name + '/log')
      if (data.logs.length >= 1) {
        this.podLogs = data.logs
      }
      this.podLogsLoading = false
    },

    // calculate duration
    calcTime (start, end = new Date()) {
      start = new Date(start)
      end = end ? new Date(end) : new Date()
      const diff = new Date(end - start)

      let result = ''
      result += diff.getUTCDate() > 1 ? (Number(diff.getUTCDate()) - 1) + 'd' : ''
      result += diff.getUTCHours() > 0 ? diff.getUTCHours() + 'h' : ''
      if (result.length < 4) {
        result += diff.getUTCMinutes() + 'm'
      }
      return result
    },

    // converter
    convertGpuToJobType (gpu) {
      let type
      if (gpu === 1) {
        type = 'g2.small'
      } else if (gpu === 2) {
        type = 'g2.medium'
      } else if (gpu === 4) {
        type = 'g2.large'
      }
      return type
    },

    // gpu rules
    gpuRules () {
      if (this.jobType) {
        let condition = (this.jobType.gpus * this.repeat <= this.remainResources('gpus') ||
                        this.$store.state.claims.level === 0)
        this.gpuErrorMessages = condition
          ? ''
          : `GPUs must be less then ${this.remainResources('gpus')} limit`
      }
      return true
    },

    candinateNames (name) {
      let candidate = []
      let i = 0
      while (candidate.length < this.repeat) {
        let newName = name + '-' + i
        if (!this.jobs.map(v => v.name).includes(newName)) {
          candidate.push(newName)
        }
        i++
      }
      return candidate
    }
  },
  computed: {
    // namePrefix
    namePrefix () {
      return 'jobs-' + this.$store.getters.namePrefix
    },

    // hint
    jobTypeHint () {
      if (this.jobType) {
        return `CPU: ${this.jobType.cpus}, Memory: ${this.jobType.memory}, GPU: ${this.jobType.gpuType} x ${this.jobType.gpus}`
      } else {
        return ''
      }
    },

    // rule
    nameRules () {
      return [
        v => (v && v.length >= 1) || 'Name is required',
        v => (v && v.length <= 30) || 'Name must be less then 30 characters',
        v => /^[a-z0-9]([-a-z0-9]*[a-z0-9])$/.test(this.$store.getters.namePrefix + v) || 'Name only can containing lowercase alphabet, number and -'
      ]
    },
    repeatRules () {
      return [
        v => !!v || 'Repeat is required',
        v => (v && Number.isInteger(v)) || 'Repeat must be integer',
        v => (v && v >= 1) || 'Repeat must be larger then 1',
        v => (v && v <= 5) || 'Repeat must be less then 5',
        this.gpuRules
      ]
    },
    jobTypeRules () {
      return [
        v => !!v || 'Job Type is required',
        this.gpuRules
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
