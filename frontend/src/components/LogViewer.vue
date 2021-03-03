<template>
  <v-card>
    <v-card-title>
      Job Logs
      <v-spacer></v-spacer>
      <v-switch
        v-model="order"
        label="Recent First"
        class="pr-3"
        @change="reorderLog"
      ></v-switch>
      <v-switch
        v-model="reload"
        label="Auto-reload"
      ></v-switch>
    </v-card-title>

    <v-card-text>
      <v-skeleton-loader
        v-if="loading"
        type="article,article,article,article,article,article"
      ></v-skeleton-loader>
      <v-virtual-scroll
        v-else
        bench="50"
        :items="logs"
        item-height="25"
        height="70vh"
      >
        <template v-slot="{ item, index }">
          <v-list-item :key="index">
            <v-list-item-action>
                {{timestampToReadable(item.timestamp)}}
              </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{item.message}}
              </v-list-item-title>
              <v-divider></v-divider>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-virtual-scroll>
      <!-- <v-data-table
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
      </v-data-table> -->
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
    reload: false,
    order: false
  }),

  methods: {

    close () {
      this.reload = false
      this.order = false
      this.$emit('close')
    },
    timestampToReadable (timestamp) {
      if (!timestamp) return ''

      var offset = new Date().getTimezoneOffset() * 60 * 1000
      timestamp = Date.parse(timestamp) - offset
      timestamp = new Date(timestamp)
      var date = timestamp.getFullYear() + '/' + this.zeroPadding(timestamp.getMonth() + 1) + '/' + this.zeroPadding(timestamp.getDate()) + ' ' +
                 this.zeroPadding(timestamp.getHours()) + ':' + this.zeroPadding(timestamp.getMinutes()) + ':' + this.zeroPadding(timestamp.getSeconds()) +
                 '.' + this.zeroPadding(timestamp.getMilliseconds())
      return date
    },
    zeroPadding (digit) {
      return ('00' + digit).slice(-2)
    },

    reorderLog () {
      this.logs.reverse()
    }
  },

  watch: {
    reload: function (newReload) {
      var delay = 30000
      if (newReload) {
        setTimeout(function request () {
          if (this.reload) {
            this.$emit('load', this.order)
          }
          setTimeout(request.bind(this), delay)
        }.bind(this), delay)
      }
    }

  }
}
</script>
