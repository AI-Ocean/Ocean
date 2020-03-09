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
              class="elevation-1"
            ></v-data-table>
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
      { text: 'photo', value: 'photoURL' },
      { text: 'UID', value: 'uid' }
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
    }
  }),
  methods: {
    async list () {
      this.loading = true
      const { data } = await this.$axios.get('/admin/users', {
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
