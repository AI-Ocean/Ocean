<template>
  <v-container grid-list-md fluid>
    <v-row>
      <v-col md="6">
        <notice-card/>
      </v-col>
      <v-col md="6">
        <schedules-card/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import NoticeCard from '@/components/home/notice'
import SchedulesCard from '@/components/home/schedules'

export default {
  name: 'home',
  data: () => ({
  }),
  components: {
    NoticeCard,
    SchedulesCard
  }
}
</script>
