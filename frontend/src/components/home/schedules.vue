<template>
  <v-card height="400">
    <v-card-title primary-title>
      Schedules
    </v-card-title>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="schedules"
        hide-default-footer
      >
        <template v-slot:item.site="{ item }">
          <a :href="item.site">Site</a>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'SchedulesCard',
  data: () => ({
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Deadline', value: 'deadline' },
      { text: 'Date', value: 'date' },
      { text: 'Location', value: 'location' },
      { text: 'Site', value: 'site' }
    ],
    schedules: []
  }),

  mounted () {
    this.getSchedules()
  },

  methods: {
    async getSchedules () {
      const { data } = await this.$axios.get('/api/schedules')
      this.schedules = data.items
    }
  }
}
</script>
