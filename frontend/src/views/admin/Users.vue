<template>
  <v-container grid-list-md fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title primary-title>
            Users
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="items"
              :options.sync="options"
              :server-items-length="totalCount"
              :loading="loading"
              :footer-props="footerProps"
            >
              <template v-slot:item.cpus="{ item }">
                <v-edit-dialog
                  :return-value.sync="item.cpus"
                  @save="changeCpus(item.uid, item.cpus)"
                > {{ item.cpus }}
                  <template v-slot:input>
                    <v-text-field
                      v-model="item.cpus"
                      :rules="[cpuRules]"
                      label="Edit"
                      single-line
                      type="number"
                      autofocus
                    ></v-text-field>
                  </template>
                </v-edit-dialog>
              </template>
              <template v-slot:item.mem="{ item }">
                <v-edit-dialog
                  :return-value.sync="item.mem"
                  @save="changeMemory(item.uid, item.mem)"
                > {{ item.mem }}
                  <template v-slot:input>
                    <v-text-field
                      v-model="item.mem"
                      :rules="[memRules]"
                      label="Edit"
                      single-line
                      type="number"
                      autofocus
                    ></v-text-field>
                  </template>
                </v-edit-dialog>
              </template>
              <template v-slot:item.gpus="{ item }">
                <v-edit-dialog
                  :return-value.sync="item.gpus"
                  @save="changeGpus(item.uid, item.gpus)"
                > {{ item.gpus }}
                  <template v-slot:input>
                    <v-text-field
                      v-model="item.gpus"
                      :rules="[gpuRules]"
                      label="Edit"
                      single-line
                      type="number"
                      autofocus
                    ></v-text-field>
                  </template>
                </v-edit-dialog>
              </template>
              <template v-slot:item.level="{ item }">
                <v-edit-dialog
                  :return-value="item.level"
                  @save="changeLevel(item.uid, item.level)"
                > {{ levelToName(item.level) }}
                  <template v-slot:input>
                    <v-select
                      v-model="item.level"
                      :items="select"
                    ></v-select>
                  </template>
                </v-edit-dialog>
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
      { text: 'Name', value: 'displayName' },
      { text: 'CPUs', value: 'cpus' },
      { text: 'Memory', value: 'mem' },
      { text: 'GPUs', value: 'gpus' },
      { text: 'level', value: 'level', width: 120 }
    ],
    select: [
      { text: 'Admin', value: 0 },
      { text: 'User', value: 1 },
      { text: 'Guest', value: 2 }
    ],
    cpuRules: v => (v <= 64 && v >= 0) || 'Input range must be between 0 to 64',
    memRules: v => (v <= 128 && v >= 0) || 'Input range must be between 0 to 128',
    gpuRules: v => (v <= 32 && v >= 0) || 'Input range must be between 0 to 32',
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
    }
  }),
  methods: {
    async list () {
      this.loading = true
      const { data } = await this.$axios.get('/api/users', {
        params: {
          offset: this.options.page > 0 ? (this.options.page - 1) * this.options.itemsPerPage : 0,
          limits: this.options.itemsPerPage,
          order: this.options.sortBy[0],
          sort: this.options.sortDesc[0] ? 'desc' : 'asc'
        }
      })
      this.items = data.items
      this.totalCount = data.totalCount
      this.loading = false
      return data
    },
    levelToName (level) {
      if (level === 0) return 'Admin'
      else if (level === 1) return 'User'
      else return 'Guest'
    },
    async changeCpus (uid, cpus) {
      await this.$axios.patch('/api/users/' + uid, { cpus })
      this.$toasted.show('CPUs changed.')
    },
    async changeMemory (uid, mem) {
      await this.$axios.patch('/api/users/' + uid, { mem })
      this.$toasted.show('Memory changed.')
    },
    async changeGpus (uid, gpus) {
      await this.$axios.patch('/api/users/' + uid, { gpus })
      this.$toasted.show('GPUs changed.')
    },
    async changeLevel (uid, level) {
      await this.$axios.patch('/api/users/' + uid, { level })
      this.$toasted.show('Level changed.')
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
