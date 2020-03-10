<template>
  <v-container fluid grid-list-md>
    <v-row>
      <v-col col="2" v-for="item in cards" :key="item.title">
        <indicator-card
          :title="item.title"
          :text="item.text"
          :color="item.color"
        ></indicator-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import IndicatorCard from './IndicatorCard'

export default {
  name: 'Indicator',
  components: {
    IndicatorCard
  },
  props: {
    resources: { type: Object },
    totalInstances: { type: Number },
    runningInstances: { type: Number },
    totalVolumes: { type: Number }
  },
  data: () => ({
    cards: []
  }),
  methods: {
    getCards () {
      this.cards = [
        { title: 'Instances', color: 'green', text: this.runningInstances + ' / ' + this.totalInstances },
        { title: 'Volumes', color: 'green', text: this.totalVolumes },
        { title: 'CPUs', color: 'orange', text: this.getText('cpus') + ' Cores' },
        { title: 'Memory', color: 'orange', text: this.getText('memory') + ' Gi' },
        { title: 'GPUs', color: 'orange', text: this.getText('gpus') + ' Cores' },
        { title: 'Capacity', color: 'orange', text: this.getText('capacity') + ' Gi' }
      ]
    },
    getText (type) {
      const { using, limit } = this.resources[type]
      return using + ' / ' + limit
    }
  },
  mounted () {
    this.getCards()
  }
}
</script>
