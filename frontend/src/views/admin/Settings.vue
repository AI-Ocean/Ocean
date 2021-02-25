<template>
  <v-container grid-list-md fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-text>
            <edit-data-table
              title="Notifications"
              :headers="noticeHeaders"
              :data="notice"
              :defaultItem="noticeDefaultItem"
              @add="addNotice"
              @change="changeNotice"
              @delete="deleteNotice"
            >
              <template v-slot:dialog="{ item }">
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field v-model="item.title" label="Title" prepend-icon="mdi-bell-outline"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-textarea solo auto-grow outlined v-model="item.content" label="Content" prepend-icon="mdi-text-box"></v-textarea>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-menu
                        v-model="menu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="item.date"
                            label="Expired Date"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker v-model="item.date" @input="menu = false"></v-date-picker>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </edit-data-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-text>
            <edit-data-table
              title="Schedules"
              :headers="schedulesHeaders"
              :data="schedules"
              :defaultItem="schedulesDefaultItem"
              @add="addSchedules"
              @change="changeSchedules"
              @delete="deleteSchedules"
            >
            <template v-slot:dialog="{ item }">
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field v-model="item.name" label="Name" prepend-icon="mdi-bell-outline"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-menu
                        v-model="menu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="item.deadline"
                            label="Deadline"
                            prepend-icon="mdi-calendar-clock"
                            readonly
                            clearable
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker v-model="item.deadline" @input="menu = false"></v-date-picker>
                      </v-menu>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-menu
                        v-model="date"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="item.date"
                            label="Date"
                            prepend-icon="mdi-calendar-clock"
                            readonly
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker v-model="item.date" range></v-date-picker>
                      </v-menu>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field v-model="item.location" label="Location" prepend-icon="mdi-map-marker"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field v-model="item.site" label="site" prepend-icon="mdi-link"></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </edit-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import EditDataTable from '@/components/EditDataTable'

export default {
  components: {
    EditDataTable
  },

  data: () => ({
    noticeHeaders: [
      { text: 'Title', sortalbe: false, value: 'title' },
      { text: 'Content', sortalbe: false, value: 'content' },
      { text: 'Date', sortalbe: false, value: 'date' },
      { text: 'Actions', sortalbe: false, value: 'actions' }
    ],
    notice: [],
    noticeDefaultItem: {
      uid: '',
      title: '',
      content: '',
      date: new Date().toISOString().substr(0, 10)
    },
    schedulesHeaders: [
      { text: 'Name', value: 'name' },
      { text: 'Deadline', value: 'deadline' },
      { text: 'Date', value: 'date' },
      { text: 'Location', value: 'location' },
      { text: 'Site', value: 'site' },
      { text: 'Actions', value: 'actions' }
    ],
    schedules: [],
    schedulesDefaultItem: {
      uid: '',
      name: '',
      deadline: '',
      date: [],
      location: '',
      site: ''
    },
    menu: false,
    date: false
  }),

  mounted () {
    this.getNotice()
    this.getSchedules()
  },

  methods: {
    async getNotice () {
      const { data } = await this.$axios.get('/api/notice?filter=all')
      this.notice = data.items
    },

    async addNotice (data) {
      delete data.uid
      await this.$axios.post('/api/notice/', data)
      this.$toasted.show('Notice added.')
    },

    async changeNotice (data) {
      const { uid } = data
      delete data.uid
      await this.$axios.patch('/api/notice/' + uid, data)
      this.$toasted.show('Notice changed.')
    },

    async deleteNotice (data) {
      const { uid } = data
      await this.$axios.delete('/api/notice/' + uid)
      this.$toasted.show('Notice deleted.')
    },

    async getSchedules () {
      const { data } = await this.$axios.get('/api/schedules?filter=all')
      this.schedules = data.items
    },

    async addSchedules (data) {
      delete data.uid
      await this.$axios.post('/api/schedules/', data)
      this.$toasted.show('Schedules added.')
    },

    async changeSchedules (data) {
      const { uid } = data
      delete data.uid
      await this.$axios.patch('/api/schedules/' + uid, data)
      this.$toasted.show('Schedules changed.')
    },

    async deleteSchedules (data) {
      const { uid } = data
      await this.$axios.delete('/api/schedules/' + uid)
      this.$toasted.show('Schedules deleted.')
    }
  }
}
</script>
