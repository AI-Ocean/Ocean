<template>
  <v-card>
    <v-card-title primary-title>
      Schedules
    </v-card-title>
    <v-card-text>
      {{ this.sc }}
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'SchedulesCard',
  data: () => ({
    sc: 'Default Schedules Example'
  })
}
</script>
