<template>
  <v-container grid-list-md fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-text>
            <edit-data-table
              title="Users"
              :headers="headers"
              :data="items"
              :defaultItem="defaultItem"
              :options.sync="options"
              :footerProps="footerProps"
              :loading="loading"
              @update="save"
              @delete="deleteItem"
            >
              <template v-slot:activated="{ item }">
                <!-- <v-checkbox v-model="item.activated" readonly></v-checkbox> -->
                <v-icon v-if="item.activated">mdi-checkbox-marked</v-icon>
                <v-icon v-else>mdi-checkbox-blank-outline</v-icon>
              </template>
              <template v-slot:createdAt="{ item }">
                <span> {{ joinedDate(item.createdAt) }} </span>
              </template>
              <template v-slot:lastSignin="{ item }">
                <span> {{ lastLoginTime(item.lastSignin) }} </span>
              </template>
              <template v-slot:dialog="{ item }">
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field v-model="item.name" label="Name"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field v-model="item.gpus" type="number" label="GPUs"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-select v-model="item.role" label="Role" :items="roles"></v-select>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-checkbox label="Activated" v-model="item.activated"></v-checkbox>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
              <template v-slot:deleteDialog="{ item }">
                <span class="subtitle-1"> Are you sure to delete <code>{{item.email}}</code>?</span>
              </template>
            </edit-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import EditDataTable from '@/components/EditDataTable.vue'
export default {
  components: { EditDataTable },
  data: () => ({
    headers: [
      { text: 'Email', value: 'email' },
      { text: 'Name', value: 'name' },
      { text: 'GPUs', value: 'gpus' },
      { text: 'Capacity', value: 'capacity' },
      { text: 'Role', value: 'role' },
      { text: 'Activated', value: 'activated' },
      { text: 'Joined', value: 'createdAt' },
      { text: 'LastSignin', value: 'lastSignin' },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    roles: [
      { text: 'Admin', value: 'admin' },
      { text: 'User', value: 'user' }
    ],
    activateds: [
      { text: 'True', value: true },
      { text: 'False', value: false }
    ],
    items: [],
    options: {
      itemsPerPage: 20,
      sortBy: ['email'],
      sortDesc: [false],
      create: false
    },
    totalCount: 0,
    loading: true,
    footerProps: {
      itemsPerPageOptions: [10, 20, 30]
    },

    defaultItem: {
      _id: '',
      name: '',
      gpus: 0,
      role: 'user',
      activated: false
    },
    dialogDelete: false
  }),
  methods: {
    async list () {
      this.loading = true
      const { data } = await this.$axios.get('/api/users', {
        params: {
          offset: this.options.page > 0 ? (this.options.page - 1) * this.options.itemsPerPage : 0,
          limits: this.options.itemsPerPage,
          order: (this.options.sortDesc[0] ? '-' : '') + (this.options.sortBy[0] || '')
        }
      })
      this.items = data.items
      this.totalCount = data.totalCount
      this.loading = false
      return data
    },
    async save (item) {
      await this.$axios.patch('/api/users/' + item._id, item)
      this.$toasted.success('User updated.')
      await this.list()
    },
    async deleteItem (item) {
      await this.$axios.delete('/api/users/' + item._id, item)
      this.$toasted.success('User deleted.')
      this.dialogDelete = false
      await this.list()
    },
    joinedDate (datetime) {
      let d = new Date(datetime)
      let month = '' + (d.getMonth() + 1)
      let day = '' + d.getDate()
      let year = d.getFullYear()

      if (month.length < 2) {
        month = '0' + month
      }
      if (day.length < 2) {
        day = '0' + day
      }

      return [year, month, day].join('-')
    },
    lastLoginTime (datetime) {
      if (!datetime) return 'Not signin yet.'
      let delta = Date.now() - Date.parse(datetime)
      return Math.round(delta / (24 * 60 * 60 * 1000)) + ' days ago'
    }
  },
  mounted: function () {
    this.$nextTick(async () => {
      await this.list()
    })
  },
  watch: {
    options: {
      handler () {
        this.list()
      }
    }
  }
}
</script>
