<template>
  <v-card>
    <v-card-title>
      Job Logs
      <v-spacer></v-spacer>
      <v-switch
        v-model="reload"
        label="Auto-reload"
      ></v-switch>
    </v-card-title>

    <v-card-text>
      <!-- <v-skeleton-loader
        v-if="loading"
        type="article,article,article,article"
      ></v-skeleton-loader>
      <v-virtual-scroll
        v-else
        bench="50"
        :items="logs"
        item-height="25"
        height="70vh"
      >
        <template v-slot="{ item, index }">
          <tr :key="index">
            <td>
              <span>{{timestampToReadable(item.timestamp)}}</span><span>{{item.message}}</span>
            </td>
          </tr>
        </template>
      </v-virtual-scroll> -->
      <v-data-table
        :headers="headers"
        :items="logs"
        :options="options"
        :loading="loading"
        dense
        fixed-header
        hide-default-footer
        height="70vh"
      >
        <template v-slot:[`item.timestamp`]="{ item }">
          {{ timestampToReadable(item.timestamp) }}
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="close">
        close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'LogViewer',
  props: {
    logs: Array,
    loading: Boolean
  },
  data: () => ({
    headers: [
      { text: 'Time', value: 'timestamp', sortable: true, filterable: false },
      { text: 'Message', value: 'message', width: '85%', sortable: false, filterable: false }
    ],
    options: {
      itemsPerPage: -1,
      sortBy: ['timestamp']
    },
    reload: false
  }),

  methods: {

    close () {
      this.reload = false
      this.$emit('close')
    },
    timestampToReadable (timestamp) {
      if (!timestamp) return ''
      let ts = timestamp.split('T')
      let time = ts[1].split('.')[0]
      return ts[0] + ' ' + time
    }
  },

  watch: {
    reload: function (newReload) {
      var iid
      if (newReload) {
        iid = setInterval(() => {
          if (this.reload) {
            this.$emit('load')
          }
        }, 30000)
      } else {
        clearInterval(iid)
      }
    }
  }
}
</script>
