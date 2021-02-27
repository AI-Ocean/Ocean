<template>
  <v-container grid-list-md fluid>
    <v-row>
      <v-col md="6">
        <!-- <notice-card/> -->
        HOME!!!!!!!!!!!!!!!!!!!!!!
        <indicator></indicator>
      </v-col>
      <v-col md="6">
        <!-- <schedules-card/> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Indicator from '../components/dashboard/Indicator.vue'
// import NoticeCard from '@/components/home/notice'
// import SchedulesCard from '@/components/home/schedules'

export default {
  components: { Indicator },
  name: 'home',
  data: () => ({
  })
  // components: {
  //   NoticeCard,
  //   SchedulesCard
  // }
}
</script>
