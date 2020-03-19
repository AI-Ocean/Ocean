<template>
  <v-card>
    <v-toolbar color="blue" flat dark>
      <v-toolbar-title>
        Volumes
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
            New Volume
          </v-card-title>
          <v-card-text>
            <v-form
              ma-4
              ref="form"
              v-model="valid"
              lazy-validation
            >
              <v-text-field
                v-model.trim="name"
                counter="30"
                :prefix="$store.getters.namePrefix"
                :rules="name_rules"
                label="Name"
                required
              >
              </v-text-field>
              <v-text-field
                v-model.number="capacity"
                :rules="cap_rules"
                type="number"
                label="Capacity"
                required
                :suffix="' / ' + remainResources('capacity') + ' Gi'"
              >
              </v-text-field>
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
      :headers="volumesHeader"
      :items="volumes"
      :loading="loading"
      hide-default-footer
    >
      <template v-slot:item.name="{ item }">
        <v-chip class="ma-1">{{ item.name }}</v-chip>
      </template>
      <template v-slot:item.delete="{ item }">
        <v-edit-dialog v-if="item.name !== 'dataset-pvc'">
          <v-icon>mdi-trash-can</v-icon>
          <template v-slot:input>
            <v-card-title>
              Delete Volume
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
  name: 'VolumesForm',
  props: {
    resources: {
      type: Object
    },
    volumes: {
      type: Array
    },
    loading: {
      type: Boolean
    }
  },
  data: () => ({
    // volumes
    volumesHeader: [
      { text: 'Name', value: 'name', sortable: false, filterable: false },
      { text: 'Capacity', value: 'capacity', sortable: false, filterable: false },
      { text: 'Status', value: 'status', sortable: false, filterable: false },
      { text: '', value: 'delete', width: 70, sortable: false, filterable: false }
    ],

    // form
    dialog: false,
    valid: false,

    name: '',
    capacity: undefined
  }),
  methods: {
    remainResources (type) {
      return (this.resources[type].limit - this.resources[type].using)
    },

    onGet () {
      this.$emit('get')
    },
    onCreate () {
      this.$emit('create', {
        name: this.$store.getters.namePrefix + this.name,
        storage_request: this.capacity
      })
      this.$emit('get')

      // reset dialog
      this.dialog = false
      this.$refs.form.reset()
      this.$refs.form.resetValidation()
    },
    onCancle () {
      this.$emit('cancle')

      // reset dialog
      this.dialog = false
      this.$refs.form.reset()
      this.$refs.form.resetValidation()
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
        v => /^[a-z0-9]([-a-z0-9]*[a-z0-9])$/.test(this.$store.getters.namePrefix + v) || 'Name only can containing lowercase alphabet, number and -',
        v => !this.volumes.map(v => v.name).includes(this.$store.getters.namePrefix + v) || 'Name already exist'
      ]
    },
    cap_rules () {
      return [
        v => !!v || 'Capacity is required',
        v => v <= this.remainResources('capacity') ||
          `Capacity must be less then ${this.remainResources('capacity')} limit`
      ]
    }
  },
  mounted () {
    this.onGet()
  }
}
</script>
