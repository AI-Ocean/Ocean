<template>
  <v-card height="400">
    <v-card-title primary-title>
      Notice
    </v-card-title>
    <v-card-text>
      <v-list three-line>
        <v-list-item v-for="(item, index) in notice" :key="index">
          <v-list-item-content>
            <v-list-item-title style="color: yellow;" >
              {{ item.title }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.content}}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'NoticeCard',
  data: () => ({
    notice: []
  }),

  mounted () {
    this.getNotice()
  },

  methods: {
    async getNotice () {
      const { data } = await this.$axios.get('/api/notice')
      this.notice = data.items
    }
  }
}
</script>

<style scoped>
.item {
  background: "white"
};
</style>
