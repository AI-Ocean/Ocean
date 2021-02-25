<template>
  <v-container grid-list-md fluid>
    <v-row>
      <v-col>
        <v-card tile>
          <v-card-text>
            <edit-data-table
              title="Volumes"
              :headers="headers"
              :data="volumes"
              :defaultItem="defaultItem"
              :options.sync="options"
              :footerProps="footerProps"
              :loading="isLoading"
              @create="createItem"
              @delete="deleteItem"
            >
              <template v-slot:dialog="{ item }">
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
                      <v-text-field
                        v-model.number="item.capacity"
                        :rules="capRules"
                        type="number"
                        label="Capacity"
                        required
                        :suffix="' / ' + remainResources('capacity') + ' Gi'"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
              <template v-slot:capacity="{ item }">
                <span>{{item.capacity}} GB</span>
              </template>
              <template v-slot:used="{ item }">
                <v-chip class="ma-1" v-for="(name, index) in usedAt(item.name)" :key="index">{{name}}</v-chip>
              </template>
              <template v-slot:action="{ item, deleteItem }">
                <v-tooltip left :disabled="usedAt(item.name).length === 0">
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <v-icon
                        v-on="on"
                        :disabled="usedAt(item.name).length !== 0"
                        @click="deleteItem(item)"
                      >
                        mdi-delete
                      </v-icon>
                    </div>
                  </template>
                  <span>Delete the Instance or Jobs in used</span>
                </v-tooltip>
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
  name: 'Volumes',
  components: { EditDataTable },
  data: () => ({
    // volumes
    headers: [
      { text: 'Name', value: 'name', width: 300, sortable: true, filterable: false },
      { text: 'Capacity', value: 'capacity', width: 100, sortable: true, filterable: false },
      { text: 'Status', value: 'status', width: 100, sortable: false, filterable: false },
      { text: 'In Used', value: 'used', sortable: false, filterable: false },
      { text: 'Actions', value: 'actions', width: 80, sortable: false, filterable: false }
    ],

    defaultItem: {
      name: '',
      capacity: 0
    },

    options: {
      itemsPerPage: 20,
      update: false
    },

    footerProps: {
      itemsPerPageOptions: [10, 20, 30]
    }

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

    usedVolumes () {
      var set = new Set()
      this.instances.map(v => v.volumes.forEach(v => set.add(v)))
      this.jobs.map(v => v.volumes.forEach(v => set.add(v)))
      return set
    },

    namePrefix () {
      return 'vol-' + this.$store.getters.namePrefix
    },

    // rule
    nameRules () {
      return [
        v => (v && v.length >= 1) || 'Name is required',
        v => (v && v.length <= 30) || 'Name must be less then 30 characters',
        v => /^[a-z0-9]([-a-z0-9]*[a-z0-9])$/.test(this.namePrefix + v) || 'Name only can containing lowercase alphabet, number and -',
        v => !this.volumes.map(v => v.name).includes(this.namePrefix + v) || 'Name already exist'
      ]
    },
    capRules () {
      return [
        v => !!v || 'Capacity is required',
        v => v <= this.remainResources('capacity') ||
          `Capacity must be less then ${this.remainResources('capacity')} limit`
      ]
    }
  },
  methods: {
    ...mapActions(resourceStore, [
      'getUserLimits',
      'getInstances',
      'getVolumes',
      'getJobs',
      'createVolume',
      'deleteVolume'
    ]),

    /// CRUD
    createItem (payload) {
      payload.name = this.namePrefix + payload.name
      this.createVolume(payload)
    },
    deleteItem (payload) {
      this.deleteVolume(payload.name)
    },

    /// utils
    usedAt (volName) {
      let used = []
      this.instances.filter(v => v.status !== 'Succeeded' && v.status !== 'Failed')
        .map(v => v.volumes.includes(volName) ? used.push(v.name) : null)
      this.jobs.filter(v => v.status !== 'Succeeded' && v.status !== 'Failed')
        .map(v => v.volumes.includes(volName) ? used.push(v.name) : null)
      return used
    },
    isDeletable (item) {
      return !this.usedVolumes.has(item.name)
    }

  },
  async created () {
    await this.getUserLimits()

    await this.getVolumes()
    await this.getInstances()
    await this.getJobs()
  }
}
</script>
