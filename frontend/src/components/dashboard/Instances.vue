<template>
  <v-card>
    <!-- header -->
    <v-toolbar color="blue" flat dark>
      <v-toolbar-title>
        Instances
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="onGet">
        <v-icon color="white">mdi-refresh</v-icon>
      </v-btn>
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
            New Instance
          </v-card-title>
          <v-card-text>
            <v-form
              ma-4
              ref="form"
              v-model="valid"
              lazy-validation
            >
              TODO NEED TO FIX PREFIX
              <v-text-field
                v-model.trim="name"
                counter="30"
                :rules="name_rules"
                label="Name"
                :prefix="$store.namePrefix"
                required
              >
              </v-text-field>
              <v-text-field
                v-model.number="cpus"
                type="number"
                :rules="cpu_rules"
                label="CPUs"
                required
                :suffix="' / ' + remainResources('cpus')"
              >
              </v-text-field>
              <v-text-field
                v-model.number="memory"
                type="number"
                :rules="memory_rules"
                label="Memory"
                required
                :suffix="' / ' + remainResources('memory')"
              >
              </v-text-field>
              <v-text-field
                v-model.number="gpus"
                :rules="gpu_rules"
                type="number"
                label="GPUs"
                required
                :suffix="' / ' + remainResources('gpus')"
              >
              </v-text-field>
              <v-select
                v-model="volume"
                :items="volumes"
                label="Volumes"
                required
                chips
              >
              </v-select>
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
      :headers="instancesHeader"
      :items="instances"
      :loading="loading"
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
        <v-edit-dialog>
          <v-icon>mdi-trash-can</v-icon>
          <template v-slot:input>
            <v-card-title>
              Delete Instance
            </v-card-title>
            <v-card-text>
              Are you sure to delete <code flat> {{ item.name }} </code>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color='red' @click="onDelete(item.name)">
                Delete
              </v-btn>
            </v-card-actions>
          </template>
        </v-edit-dialog>
      </template>
    </v-data-table>
    <!-- end data table -->

  </v-card>
</template>

<script>
export default {
  name: 'Instances',
  props: {
    resources: {
      type: Object
    },
    instances: {
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

    // form
    dialog: false,
    valid: false,

    name: undefined,
    cpus: undefined,
    memory: undefined,
    gpus: undefined,
    volume: undefined
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

    onGet () {
      this.$emit('get')
    },
    onCreate () {
      // request create pods
      this.$emit('create', {
        name: this.$store.namePrefix + this.name,
        cpu_request: this.cpus,
        memory_request: this.memory,
        gpu_request: this.gpus,
        volume_name: this.volume
      })
      this.$emit('get')

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
      this.$emit('delete', name)
      this.$emit('get')
    }
  },
  computed: {
    // rule
    name_rules () {
      return [
        v => !!v || 'Name is required',
        v => (v && v.length <= 30) || 'Name must be less then 30 characters',
        v => /^[a-z0-9]([-a-z0-9]*[a-z0-9])$/.test(this.$store.namePrefix + v) || 'Name only can containing lowercase alphabet, number and -',
        v => !this.instances.map(v => v.name).includes(this.$store.namePrefix + v) || 'Name already exist'
      ]
    },
    cpu_rules () {
      return [
        v => !!v || 'CPUs is required',
        v => v <= this.remainResources('cpus') ||
          `CPUs must be less then ${this.remainResources('cpus')} limit`
      ]
    },
    memory_rules () {
      return [
        v => !!v || 'Memory is required',
        v => v <= this.remainResources('memory') ||
          `Memory must be less then ${this.remainResources('memory')} limit`
      ]
    },
    gpu_rules () {
      return [
        v => !!v || 'GPUs is required',
        v => v <= this.remainResources('gpus') ||
          `GPUs must be less then ${this.remainResources('gpus')} limit`
      ]
    }
  },
  mounted () {
    this.onGet()
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
