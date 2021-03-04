<template>
  <v-container grid-list-md fluid>
    <v-row>
      <v-col md="12">
        <!-- <notice-card/> -->
        <!-- HOME!!!!!!!!!!!!!!!!!!!!!! -->
        <indicator
          :instances="instances"
          :volumes="volumes"
          :jobs="jobs"
          :resources="resources"
        ></indicator>
      </v-col>
      <v-col md="6">
        <!-- <schedules-card/> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Indicator from '@/components/Indicator.vue'
const resourceStore = 'resourceStore'

export default {
  components: { Indicator },
  name: 'home',
  data: () => ({
  }),
  computed: {
    ...mapState(resourceStore, [
      'instances',
      'volumes',
      'jobs',
      'resources'
    ])
  },

  methods: {
    ...mapActions(resourceStore, [
      'getUserLimits',
      'getAllWorkloads'
    ])
  },

  async created () {
    await this.getUserLimits()
    await this.getAllWorkloads()
  }
}
</script>
