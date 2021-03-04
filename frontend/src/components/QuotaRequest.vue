<template>
  <v-card
    width="1000px"
    dark
  >
    <v-card-text>
      <edit-data-table
        title="Quota Requests"
        :headers="headers"
        :data="requests"
        :defaultItem="defaultItem"
        :options.sync="options"
        :loading="isLoading"
        @create="createItem"
        @update="updateItem"
        @delete="deleteItem"
        @close="close"
      >
        <!-- Fields -->
        <template v-slot:startDate="{ item }">
          {{ (new Date(item.startDate)).toISOString().split('T')[0] }}
        </template>
        <template v-slot:endDate="{ item }">
          {{ (new Date(item.startDate)).toISOString().split('T')[0] }}
        </template>

        <!-- Dialog -->
        <template v-slot:dialog="{ item, index }">
          <v-text-field
            v-model="item.quota"
            label="Request GPUs"
            type="number"
            suffix="Cores"
            :rules="gpuRules"
            required
            :disabled="index !== -1"
          ></v-text-field>
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-right="40"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="item.date"
                label="Usage period"
                :prefix="new Date().toISOString().substr(0, 10) + ' ~ '"
                readonly
                v-bind="attrs"
                v-on="on"
                :disabled="index !== -1"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="item.date"
              @input="menu = false"
            ></v-date-picker>
          </v-menu>
          <v-text-field
            v-model="item.reason"
            label="Reason"
            type="text"
            hint="brief reason about this requesting"
            persistent-hint
            :rules="[v => !!v || 'Reason is required']"
            required
            :disabled="index !== -1"
          ></v-text-field>
          <v-divider v-if="index !== -1" class="mt-5 mb-5"></v-divider>
          <v-select
            v-if="index !== -1"
            v-model="item.status"
            :items="statusList"
            :rules="[v => !!v || 'Status is required']"
            label="Status"
            auto
            la
            required
          ></v-select>
          <v-text-field
            v-if="index !== -1"
            v-model="item.rejectedReason"
            label="RejectedReason"
            required
          ></v-text-field>
        </template>
      </edit-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import EditDataTable from './EditDataTable.vue'

export default {
  name: 'QuotaRequest',
  components: { EditDataTable },
  props: {
    displayAll: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    headers: [
      { text: 'Status', value: 'status', width: 10, sortable: true, filterable: true },
      { text: 'Quota', value: 'quota', width: 10, sortable: true, filterable: false },
      { text: 'StartDate', value: 'startDate', width: 20, sortable: true, filterable: false },
      { text: 'EndDate', value: 'endDate', width: 20, sortable: true, filterable: false },
      { text: 'Reason', value: 'reason', width: 50, sortable: false, filterable: false },
      { text: 'RejectedReason', value: 'rejectedReason', width: 50, sortable: false, filterable: false },
      { text: 'Actions', value: 'actions', width: 50, sortable: false, filterable: false }
    ],
    options: {
      itemsPerPage: 10,
      create: true,
      update: false,
      delete: true
    },
    defaultItem: {
      status: 'pending',
      quota: 0,
      date: new Date().toISOString().substr(0, 10),
      reason: '',
      rejectedReason: ''
    },
    statusList: [
      'pending',
      'approved',
      'rejected'
    ],

    requests: [],
    isLoading: false,

    gpuRules: [
      v => !!v || 'GPUs is required',
      v => (v && Number.isInteger(Number(v))) || 'GPUs must be integer'
    ],

    menu: false
  }),

  methods: {
    async getRequests () {
      this.isLoading = true
      let data = await this.$axios.get('/api/resources/request?all=' + this.displayAll)
      this.requests = data.data
      this.isLoading = false
    },
    async createItem (payload) {
      let newPayload = {
        quota: Number(payload.quota),
        startDate: Number(new Date()),
        endDate: Number(Date(payload.date)),
        reason: payload.reason
      }
      await this.$axios.post('/api/resources/request', newPayload)

      this.$toasted.success('Quota request success.')
      this.getRequests()
      this.requestDialog = false
    },
    async updateItem (payload) {
      if (payload.status === 'approved') {
        await this.$axios.patch('/api/users/' + payload.user, { gpus: payload.quota })
      }

      let newPayload = {
        status: payload.status,
        rejectedReason: payload.rejectedReason
      }
      await this.$axios.patch('/api/resources/request/' + payload._id, newPayload)

      this.$toasted.success('Edit quota request success.')
      this.getRequests()
      this.requestDialog = false
    },
    async deleteItem (payload) {
      await this.$axios.delete('/api/resources/request/' + payload._id)

      this.$toasted.success('Delete quota request success.')
      this.getRequests()
      this.requestDialog = false
    },
    close () {
      this.requestDialog = false
    }
  },

  async created () {
    this.options.update = this.$store.getters.isAdmin
    this.defaultItem.quota = this.$store.state.userStore.user.gpus
    await this.getRequests()
  }

}
</script>

<style scoped>

</style>
