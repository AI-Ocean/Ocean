<template>
  <v-card height="300">
    <v-card-title primary-title>
      Notice
    </v-card-title>
    <v-list-item v-for="(item, index) in notices" :key="index">
      {{ item }}
    </v-list-item>
  </v-card>
</template>

<script>
export default {
  name: 'NoticeCard',
  data: () => ({
    notices: [' Currently on Beta-Testing', '<<-- Go To Dashboard.']
  })
}
</script>
