<template>
  <v-container grid-list-md fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title primary-title>
            Users
          </v-card-title>
          <v-card-text>
            <v-dialog
              v-model="dialog"
              max-width="500px"
            >
              <v-card>
                <v-card-title>
                  <span class="headline">Edit Item</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-text-field
                          v-model="editedItem.name"
                          label="Name"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-text-field
                          v-model="editedItem.gpus"
                          type="number"
                          label="GPUs"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-select
                          v-model="editedItem.role"
                          label="Role"
                          :items="roles"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="save"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline">
                  <span> Are you sure you want to delete User? </span>
                  <code>{{editedItem.email}}</code>
                </v-card-title>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                  <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-data-table
              :headers="headers"
              :items="items"
              :options.sync="options"
              :server-items-length="totalCount"
              :loading="loading"
              :footer-props="footerProps"
            >
              <template v-slot:[`item.actions`]="{ item }">
                <v-icon
                  small
                  class="mr-2"
                  @click="editItem(item)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  small
                  @click="deleteItem(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    headers: [
      { text: 'Email', value: 'email' },
      { text: 'Name', value: 'name' },
      { text: 'GPUs', value: 'gpus' },
      { text: 'Role', value: 'role' },
      { text: 'Joined', value: 'createdAt' },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    roles: [
      { text: 'Admin', value: 'admin' },
      { text: 'User', value: 'user' }
    ],
    items: [],
    options: {
      itemsPerPage: 20,
      sortBy: ['email'],
      sortDesc: [false]
    },
    totalCount: 0,
    loading: true,
    footerProps: {
      itemsPerPageOptions: [10, 20, 30]
    },

    dialog: false,
    editedItem: {
      id: '',
      name: '',
      gpus: 0,
      role: 'user'
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
    editItem (item) {
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem (item) {
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    async save () {
      await this.$axios.patch('/api/users/' + this.editedItem._id, this.editedItem)
      this.$toasted.success('User updated.')
      this.dialog = false
      await this.list()
    },
    close () {
      this.dialog = false
    },
    async deleteItemConfirm () {
      await this.$axios.delete('/api/users/' + this.editedItem._id, this.editedItem)
      this.$toasted.success('User deleted.')
      this.dialogDelete = false
      await this.list()
    },
    closeDelete () {
      this.dialogDelete = false
    }
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
