<template>
  <v-card tile>
    <!-- header -->
    <!-- <v-toolbar flat dark>
      <v-toolbar-title>
        Instances
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="dialog=true" v-if="instances.length <= 0 || $store.getters.level <= 0">
        <v-icon color="white">mdi-plus-box</v-icon>
      </v-btn> -->

      <v-card-text>
        <edit-data-table
          title="Instances"
          :headers="headers"
          :data="instances"
          :defaultItem="defaultItem"
          :options.sync="options"
          :footerProps="footerProps"
          :loading="loading"
          @add="add"
          @delete="deleteItem"
          @close="close"
        >
          <template v-slot:dialog="{ item }">
            <v-form
              ma-4
              ref="form"
              v-model="valid"
            >
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

      <!-- form dialog -->
    <!-- </v-toolbar> -->
    <!-- end header -->

    <!-- data table -->
    <!-- <v-data-table
      :headers="instancesHeader"
      :items="instances"
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
    </v-data-table> -->
    <!-- end data table -->

    <!-- <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>
          Delete Instances
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
    </v-dialog> -->

  </v-card>
</template>

<script>
import EditDataTable from '../../components/admin/EditDataTable.vue'
export default {
  name: 'Instances',
  components: { EditDataTable },
  props: {
    resources: Object,
    instances: Array,
    volumes: Array,
    loading: Boolean
  },
  data: () => ({
    // instances
    headers: [
      { text: 'Status', value: 'status', width: 80, sortable: false, filterable: false },
      { text: 'Name', value: 'name', width: 200, sortable: false, filterable: false },
      { text: 'CPUs', value: 'cpus', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'Memory', value: 'memory', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'GPUs', value: 'gpus', width: 80, align: 'end', sortable: false, filterable: false },
      { text: 'SSH port', value: 'port', sortable: false, filterable: false },
      { text: 'Volumes', value: 'volumes', sortable: false, filterable: false },
      { text: 'Actions', value: 'actions', width: 70, sortable: false, filterable: false }
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
      add: true,
      edit: false
    },
    footerProps: {
      itemsPerPageOptions: [10, 20, 30]
    },

    // form
    // dialog: false,
    valid: false,
    // name: undefined,
    // image: '',
    searchImage: '',
    // instanceType: { name: 'g1.small', cpus: 4, memory: 16, gpus: 1, gpuType: 'nvidia-gtx-1080ti' },
    // volume: undefined,

    // data table
    deleteDialog: false,
    targetName: ''
  }),
  methods: {
    // stataus icon
    getStatusIcon (status) {
      if (status === 'Running') return 'mdi-check-circle'
      else if (status === 'Succeeded') return 'mdi-check-decagram'
      else if (status === 'Pending' || status === 'Terminating') return 'mdi-loading'
      else return 'mdi-alert-circle'
    },

    // openDeleteDialog (name) {
    //   this.deleteDialog = true
    //   this.targetName = name
    // },

    // resetForm () {
    //   this.$refs.form.resetValidation()
    //   this.$refs.form.reset()
    //   this.instanceType = { name: 'g1.small', cpus: 4, memory: 16, gpus: 1, gpuType: 'nvidia-gtx-1080ti' }
    // },

    onGet () {
      this.$emit('get')
    },
    add () {
      // request create pods
      this.$emit('create', {
        name: this.namePrefix + this.name,
        image: this.image,
        cpu_request: this.instanceType.cpus,
        memory_request: this.instanceType.memory,
        gpu_request: this.instanceType.gpus,
        gpu_type: this.instanceType.gpuType,
        volume_name: this.volume
      })
    },
    deleteItem (name) {
      this.$emit('delete', name)
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
    namePrefix () {
      return 'inst-' + this.$store.getters.namePrefix
    },
    // rule
    nameRules () {
      return [
        v => (v && v.length >= 1) || 'Name is required',
        v => (v && v.length <= 30) || 'Name must be less then 30 characters',
        v => /^[a-z0-9]([-a-z0-9]*[a-z0-9])$/.test(this.$store.getters.namePrefix + v) || 'Name only can containing lowercase alphabet, number and -',
        v => !this.instances.map(v => v.name).includes(this.namePrefix + v) || 'Name already exist'
      ]
    },
    volumeRules () {
      return [
        v => !!v || 'Volume is required'
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
