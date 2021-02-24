<template>
  <v-container grid-list-md fluid>
    <v-row>
      <v-col>
        <v-card tile>
          <v-card-text>
            <edit-data-table
              title="Instances"
              :headers="headers"
              :data="instances"
              :defaultItem="defaultItem"
              :options.sync="options"
              :footerProps="footerProps"
              :loading="isLoading"
              @create="createItem"
              @delete="deleteItem"
              @close="close"
            >
              <template v-slot:dialog="{ item }">
                <v-form ma-4 ref="form" v-model="valid">
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model.trim="item.name"
                          counter="30"
                          :rules="nameRules"
                          label="Name"
                          :prefix="namePrefix"
                          required
                        >
                        </v-text-field>
                      </v-col>
                      <v-col cols="12">
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
                      </v-col>
                      <v-col cols="12">
                        <v-select
                          v-model="item.instanceType"
                          :items="instancesList"
                          label="Instance Type"
                          auto
                          required
                          :hint="instanceTypeHint(item)"
                          persistent-hint
                        >
                        </v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-select
                          v-model="item.volume"
                          :items="volumes"
                          item-text="name"
                          label="Volumes"
                          :rules="volumeRules"
                          required
                          chips
                        >
                        </v-select>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </template>
              <template v-slot:status="{ item }">
                <v-icon :class="item.status" :alt="item.status">{{ getStatusIcon(item.status) }}</v-icon>
              </template>
              <template v-slot:volumes="{ item }">
                <v-chip class="ma-1" v-for="(vol, index) in item.volumes" :key="index">{{vol}}</v-chip>
              </template>
            </edit-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import EditDataTable from '@/components/admin/EditDataTable.vue'

const resourceStore = 'resourceStore'

export default {
  name: 'Instances',
  components: { EditDataTable },
  data: () => ({
    // instances
    headers: [
      { text: 'Status', value: 'status', width: 100, sortable: false, filterable: false },
      { text: 'Name', value: 'name', width: 300, sortable: false, filterable: false },
      { text: 'CPUs', value: 'cpus', width: 100, align: 'end', sortable: false, filterable: false },
      { text: 'Memory', value: 'memory', width: 100, align: 'end', sortable: false, filterable: false },
      { text: 'GPUs', value: 'gpus', width: 100, align: 'end', sortable: false, filterable: false },
      { text: 'SSH port', value: 'port', width: 150, sortable: false, filterable: false },
      { text: 'Volumes', value: 'volumes', sortable: false, filterable: false },
      { text: 'Actions', value: 'actions', width: 100, sortable: false, filterable: false }
    ],

    imagesList: [
      { header: 'Select an option or type other images' },
      'mlvclab/pytorch:1.5-cuda10.1-cudnn7-devel',
      'mlvclab/pytorch:1.6.0-cuda10.1-cudnn7-devel'
    ],

    instancesList: [
      { text: 'g1.small', value: { name: 'g1.small', cpus: 4, memory: 16, gpus: 1, gpuType: 'nvidia-gtx-1080ti' } },
      { text: 'g2.small', value: { name: 'g2.small', cpus: 4, memory: 16, gpus: 1, gpuType: 'nvidia-rtx-2080ti' } }
    ],

    defaultItem: {
      name: '',
      image: undefined,
      searchImage: '',
      instanceType: '',
      volume: ''
    },

    options: {
      itemsPerPage: 20,
      update: false
    },

    footerProps: {
      itemsPerPageOptions: [10, 20, 30]
    },

    // form
    valid: false,
    searchImage: ''
  }),
  methods: {
    ...mapActions(resourceStore, [
      'getUserLimits',
      'getInstances',
      'createInstance',
      'deleteInstance',
      'getVolumes'
    ]),

    // stataus icon
    getStatusIcon (status) {
      if (status === 'Running') return 'mdi-check-circle'
      else if (status === 'Succeeded') return 'mdi-check-decagram'
      else if (status === 'Pending' || status === 'Terminating') return 'mdi-loading'
      else return 'mdi-alert-circle'
    },

    /// CRUD
    createItem (payload) {
      const newPayload = {}
      newPayload.name = this.namePrefix + payload.name
      newPayload.image = payload.image
      newPayload.cpu_request = payload.instanceType.cpus
      newPayload.memory_request = payload.instanceType.memory
      newPayload.gpu_request = payload.instanceType.gpus
      newPayload.gpu_type = payload.instanceType.gpuType
      newPayload.volume = payload.volume
      this.createInstance(newPayload)
    },
    deleteItem (payload) {
      this.deleteInstance(payload.name)
    },
    close () {
      this.$refs.form.resetValidation()
    },

    instanceTypeHint (item) {
      if (item.instanceType) {
        return `CPU: ${item.instanceType ? item.instanceType.cpus : ''},
              Memory: ${item.instanceType ? item.instanceType.memory : ''},
              GPU: ${item.instanceType ? item.instanceType.gpuType : ''} x
              ${item.instanceType ? item.instanceType.gpus : ''}`
      }
      return ''
    }
  },
  computed: {
    ...mapState(resourceStore, [
      'resources',
      'instances',
      'volumes'
    ]),
    ...mapGetters(resourceStore, [
      'isLoading'
    ]),

    namePrefix () {
      return 'inst-' + this.$store.getters.namePrefix
    },

    // rule
    nameRules () {
      return [
        v => (v && v.length >= 1) || 'Name is required',
        v => (v && v.length <= 30) || 'Name must be less then 30 characters',
        v => /^[a-z0-9]([-a-z0-9]*[a-z0-9])$/.test(this.namePrefix + v) || 'Name only can containing lowercase alphabet, number and -',
        v => !this.instances.map(v => v.name).includes(this.namePrefix + v) || 'Name already exist'
      ]
    },
    volumeRules () {
      return [
        v => !!v || 'Volume is required'
      ]
    },
    imageRules () {
      return [
        v => !!v || 'Image is required'
      ]
    }
  },
  async created () {
    await this.getUserLimits()

    await this.getInstances()
    await this.getVolumes()
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

.Terminating {
  animation-name: spin;
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  color: red;
}

.Failed {
  color: red;
}
</style>
