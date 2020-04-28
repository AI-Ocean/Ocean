<template>
  <v-card height="400">
    <v-card-title primary-title>
      Schedules
    </v-card-title>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="conferences"
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
      { text: 'Location', value: 'location' },
      { text: 'Deadline', value: 'deadline' },
      { text: 'Site', value: 'site' }
    ],
    conferences: [
      {
        name: 'NeurIPS 2020',
        location: 'Vancouver, Canada',
        deadline: 'May 12, 2020 (13)',
        site: 'https://nips.cc/Conferences/2020'
      },
      {
        name: 'AAAI 2021',
        location: 'Vancouver, British Columbia, Canada',
        deadline: 'Sep 5, 2020 (TBD)',
        site: 'https://aaai.org/Conferences/AAAI-21'
      },
      {
        name: 'CVPR 2021',
        location: 'Nashville, TN, United States',
        deadline: 'Nov 15, 2020 (TBD)',
        site: 'http://cvpr2021.thecvf.com'
      },
      {
        name: 'ICCV 2021',
        location: 'Montreal, Canada',
        deadline: 'TBD',
        site: 'http://iccv2021.thecvf.com'
      }
    ]
  })
}
</script>
