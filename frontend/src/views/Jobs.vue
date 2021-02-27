<template>
  <v-container grid-list-md fluid>
    <v-row>
      <v-col>
        <v-card tile>
          <!-- data table -->
          <edit-data-table
            title="Jobs"
            showSelect
            :headers="headers"
            :data="jobs"
            :defaultItem="defaultItem"
            :options.sync="options"
            :footerProps="footerProps"
            :loading="isLoading"
            :copyItemPreprocess="[ copyItemPreprocess ]"
            @create="createItem"
            @delete="deleteItem"
            @close="close"
          >
          <template v-slot:topActions="{ }">
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
          </template>

          <template v-slot:status="{ item }">
            <v-icon :class="item.status">{{ getStatusIcon(item.status) }}</v-icon>
          </template>
          <template v-slot:gpus="{ item }">
            <v-chip class="ma-1">{{ convertGpuToJobType(item.accelerator, Number(item.gpus)) }}</v-chip>
          </template>
          <template v-slot:volumes="{ item }">
            <v-chip class="ma-1" v-for="v in item.volumes" :key="v">{{ v }}</v-chip>
          </template>
          <template v-slot:command="{ item }">
            {{item.command.join(' ')}}
          </template>
          <template v-slot:duration="{ item }">
            {{ calcTime(item.startTime, item.completionTime) }}
          </template>
          <template v-slot:age="{ item }">
            {{ calcTime(item.startTime) }}
          </template>
          <template v-slot:logs="{ item }">
            <v-btn text @click="openLogDialog(item.name)">
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
          </template>

          <template v-slot:dialog="{ item }">
            <v-text-field
              v-model.trim="item.name"
              counter="30"
              :rules="nameRules"
              label="Name"
              :prefix="namePrefix"
              required
            ></v-text-field>
            <span v-if="item.repeat <= 5">Names:
              <span v-for="(cn) in candidateNames(namePrefix + item.name, item.repeat)" :key="cn"><code>{{ cn }}</code>{{' '}}</span>
            </span>
            <v-combobox
              v-model.trim="item.image"
              :items="imagesList"
              :hide-no-data="!searchImage"
              :search-input.sync="searchImage"
              :rules="imageRules"
              label="Image"
              required
              persistent-hint
              hint="You can add other image"
            >
              <template v-slot:no-data>
                <v-list-item>
                  <span class="subheading">Create</span>
                    {{ searchImage }}
                </v-list-item>
              </template>
            </v-combobox>
            <v-row>
              <v-col cols=8>
                <v-select
                  v-model="item.jobType"
                  :items="jobsList"
                  :rules="[...jobTypeRules, gpuRules(item)]"
                  label="Job Type"
                  auto
                  la
                  required
                  :hint="jobTypeHint(item)"
                  persistent-hint
                  :error-messages="gpuErrorMessages"
                  ref="jobType"
                ></v-select>
              </v-col>
              <v-col cols=1>
              </v-col>
              <v-col cols=3>
                <v-text-field
                  v-model.number="item.repeat"
                  type="number"
                  :rules="[...repeatRules, gpuRules(item)]"
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
              v-model="item.volume"
              :items="volumes"
              item-text="name"
              label="Volumes"
              :rules="requiredRules"
              required
              chips
            ></v-select>
            <v-text-field
              v-model="item.command"
              :rules="commandRules"
              type="string"
              label="Command"
              required
              hint="Shell Command to Run"
            ></v-text-field>
          </template>
        </edit-data-table>

        <v-dialog v-model="logDialog" scrollable>
          <log-viewer
            :loading="logLoading"
            :logs="logs"
            @load="loadLog"
            @close="() => {logDialog = false}"
          ></log-viewer>
        </v-dialog>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import EditDataTable from '@/components/EditDataTable.vue'
import LogViewer from '@/components/LogViewer.vue'

const resourceStore = 'resourceStore'

export default {
  name: 'Jobs',
  components: { EditDataTable, LogViewer },
  data: () => ({
    headers: [
      { text: 'Status', value: 'status', width: 10, sortable: true, filterable: false },
      { text: 'Name', value: 'name', width: 50, sortable: true, filterable: false },
      { text: 'Type', value: 'gpus', width: 10, sortable: true, filterable: false },
      { text: 'Volumes', value: 'volumes', width: 10, sortable: false, filterable: false },
      { text: 'Command', value: 'command', width: 50, sortable: false, filterable: false },
      { text: 'Duration', value: 'duration', width: 20, sortable: true, filterable: false },
      { text: 'Age', value: 'age', width: 10, sortable: true, filterable: false },
      { text: 'Logs', value: 'logs', width: 10, sortable: false, filterable: false }
    ],

    imagesList: [
      { header: 'Select an option or type other images' },
      'mlvclab/pytorch:1.5-cuda10.1-cudnn7-devel',
      'mlvclab/pytorch:1.6.0-cuda10.1-cudnn7-devel'
    ],

    jobsList: [
      { text: 'g2.small', value: { name: 'g2.small', cpus: 4, memory: 16, gpus: 1, gpuType: 'nvidia-rtx-2080ti' } },
      { text: 'g2.medium', value: { name: 'g2.medium', cpus: 8, memory: 32, gpus: 2, gpuType: 'nvidia-rtx-2080ti' } },
      { text: 'g2.large', value: { name: 'g2.large', cpus: 16, memory: 64, gpus: 4, gpuType: 'nvidia-rtx-2080ti' } },
      { text: 'g3.large', value: { name: 'g3.large', cpus: 16, memory: 64, gpus: 4, gpuType: 'nvidia-rtx-3090' } },
      { text: 'v100.xlarge', value: { name: 'v100.xlarge', cpus: 32, memory: 128, gpus: 8, gpuType: 'nvidia-tesla-v100' } }
    ],

    defaultItem: {
      name: '',
      image: undefined,
      searchImage: '',
      jobType: '',
      repeat: 1,
      volume: '',
      command: ''
    },

    options: {
      itemsPerPage: 10,
      deleteTop: true,
      copy: true
    },

    footerProps: {
      itemsPerPageOptions: [10, 20, 30]
    },

    // form
    valid: false,
    searchImage: '',
    gpuErrorMessages: '',

    // data table
    logDialog: false,
    logLoading: false,
    logs: [],
    logPodName: ''
  }),

  computed: {
    ...mapState(resourceStore, [
      'resources',
      'instances',
      'jobs',
      'volumes'
    ]),
    ...mapGetters(resourceStore, [
      'isLoading',
      'remainResources'
    ]),

    // namePrefix
    namePrefix () {
      return 'jobs-' + this.$store.getters.namePrefix
    },

    // rule
    nameRules () {
      return [
        v => (v && v.length >= 1) || 'Name is required',
        v => (v && v.length <= 40) || 'Name must be less then 30 characters',
        v => /^[a-z0-9]([-a-z0-9]*[a-z0-9])$/.test(this.$store.getters.namePrefix + v) || 'Name only can containing lowercase alphabet, number and -'
      ]
    },
    imageRules () {
      return [
        v => !!v || 'Image is required'
      ]
    },
    // gpu rules
    repeatRules () {
      return [
        v => !!v || 'Repeat is required',
        v => (v && Number.isInteger(v)) || 'Repeat must be integer',
        v => (v && v >= 1) || 'Repeat must be larger then 1',
        v => (v && v <= 5) || 'Repeat must be less then 5'
      ]
    },
    jobTypeRules () {
      return [
        v => !!v || 'Job Type is required'
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
  },

  methods: {
    ...mapActions(resourceStore, [
      'getUserLimits',
      'getAllWorkloads',
      'createJob',
      'deleteJob'
    ]),

    // stataus icon
    getStatusIcon (status) {
      if (status === 'Succeeded') return 'mdi-check-decagram'
      else if (status === 'Running' || status === 'Pending' || status === 'Terminating') return 'mdi-loading'
      else return 'mdi-alert-circle'
    },

    // CRUD
    createItem (payload) {
      // request create pods
      let name = this.namePrefix + payload.name
      let body = {
        image: payload.image,
        cpu_request: payload.jobType.cpus,
        memory_request: payload.jobType.memory,
        gpu_request: payload.jobType.gpus,
        gpu_type: payload.jobType.gpuType,
        volume_name: payload.volume,
        command: payload.command.split(' ')
      }

      this.candidateNames(name, payload.repeat).forEach(cn => {
        body.name = cn
        this.createJob(body)
      })
    },
    deleteItem (payload) {
      this.deleteJob(payload.name)
    },
    close () {
      this.gpuErrorMessages = ''
    },

    // dialog repeat
    increment () {
      this.repeat = parseInt(this.repeat) + 1
    },
    decrement () {
      this.repeat = parseInt(this.repeat) - 1
    },

    async openLogDialog (name) {
      this.log = []
      this.logPodName = name
      this.logDialog = true
      await this.loadLog(name)
    },
    async loadLog () {
      this.logLoading = true
      this.getAllWorkloads()
      const { data } = await this.$axios.get('/api/jobs/' + this.logPodName + '/log')
      if (data.logs.length >= 1) {
        this.logs = data.logs.split('\n').map(v => {
          let row = v.split('Z')
          return { timestamp: row[0], message: row.slice(1).join('Z') }
        })
      }
      this.logs.splice(-1, 1)
      this.logLoading = false
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
    convertGpuToJobType (type, gpus) {
      let jobType
      if (type === 'nvidia-gtx-1080ti') {
        jobType = 'g1'
      } else if (type === 'nvidia-rtx-2080ti') {
        jobType = 'g2'
      } else if (type === 'nvidia-rtx-3090') {
        jobType = 'g3'
      } else if (type === 'nvidia-tesla-v100') {
        jobType = 'v100'
      }

      if (gpus === 1) {
        jobType += '.small'
      } else if (gpus === 2) {
        jobType += '.medium'
      } else if (gpus === 4) {
        jobType += '.large'
      } else if (gpus === 8) {
        jobType += '.xlarge'
      }
      return jobType
    },

    copyItemPreprocess (item) {
      let newItem = Object.assign({}, item)
      newItem.name = item.name.split('-').slice(2, -1).join('-')
      newItem.repeat = 1
      newItem.jobType = this.jobsList.find(
        v => v.text === this.convertGpuToJobType(item.accelerator, Number(item.gpus))).value
      newItem.volume = item.volumes[0]
      newItem.command = item.command.join(' ')
      return newItem
    },

    // hint
    jobTypeHint (item) {
      if (item.jobType) {
        return `CPU: ${item.jobType.cpus},
                Memory: ${item.jobType.memory},
                GPU: ${item.jobType.gpuType} x ${item.jobType.gpus}`
      } else {
        return ''
      }
    },

    // rules
    gpuRules (item) {
      if (item.jobType) {
        let condition = (item.jobType.gpus * item.repeat <= this.remainResources('gpus') ||
                         this.$store.getters.isAdmin)
        this.gpuErrorMessages = condition
          ? ''
          : `Quota exceeded. GPU must be less then ${this.remainResources('gpus')}`
      }
      return true
    },

    candidateNames (name, repeat) {
      let candidate = []
      let i = 0
      while (candidate.length < repeat) {
        let newName = name + '-' + i
        if (!this.jobs.map(v => v.name).includes(newName)) {
          candidate.push(newName)
        }
        i++
      }
      return candidate
    }
  },
  async created () {
    await this.getUserLimits()

    await this.getAllWorkloads()
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

.Terminating {
  color: red;
  animation-name: spin;
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
</style>
