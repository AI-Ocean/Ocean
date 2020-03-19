<template>
  <v-container fluid grid-list-md>
    <v-row>
      <v-col sm="12" md="4">
        <v-card>
          <v-toolbar color="orange" flat dark>
            <v-toolbar-title>
              Resources Status
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text pa-0>
            <v-container fluid pa-0>
              <v-row pa-0>
                <v-col pa-0 cols="6">
                  <GChart
                    type="PieChart"
                    :data="instancesData"
                    :options="chartOptions"
                    :resizeDebounce="10"
                  ></GChart>
                  <p class='title text-center mt-2 ma-0'>Instances</p>
                </v-col>
                <v-col pa-0 cols="6">
                  <GChart
                    type="PieChart"
                    :data="volumesData"
                    :options="chartOptions"
                    :resizeDebounce="10"
                  ></GChart>
                  <p class='title text-center mt-2 ma-0'>Volumes</p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col sm="12" md="8">
        <v-card>
          <v-toolbar color="orange" flat dark>
            <v-toolbar-title>
              Workloads Status
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text pa-0>
            <v-container fluid pa-0>
              <v-row pa-0>
                <v-col pa-0 sm="3" xs="6">
                  <GChart
                    type="PieChart"
                    :data="cpusData"
                    :options="resourcesChartOptions"
                    :resizeDebounce="10"
                  ></GChart>
                  <p class='title text-center mt-2 ma-0'>CPU</p>
                </v-col>
                <v-col pa-0 sm="3" xs="6">
                  <GChart
                    type="PieChart"
                    :data="memoryData"
                    :options="resourcesChartOptions"
                    :resizeDebounce="10"
                  ></GChart>
                  <p class='title text-center mt-2 ma-0'>Memory</p>
                </v-col>
                <v-col pa-0 sm="3" xs="6">
                  <GChart
                    type="PieChart"
                    :data="gpusData"
                    :options="resourcesChartOptions"
                    :resizeDebounce="10"
                  ></GChart>
                  <p class='title text-center mt-2 ma-0'>GPU</p>
                </v-col>
                <v-col pa-0 sm="3" xs="6">
                  <GChart
                    type="PieChart"
                    :data="capacityData"
                    :options="resourcesChartOptions"
                    :resizeDebounce="10"
                  ></GChart>
                  <p class='title text-center mt-2 ma-0'>Capacity</p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Indicator',
  props: {
    instances: Array,
    volumes: Array,
    resources: Object
  },
  data: () => ({
    chartOptions: {
      legend: 'none',
      height: 150,
      colors: ['#4CAF50', '#FF9800', '#F44336'],
      chartArea: { width: '100%', height: '90%' },
      animation: { duration: 1000, easing: 'out', startup: true },
      pieSliceTextStyle: { fontSize: 20 }
    },
    resourcesChartOptions: {
      legend: 'none',
      height: 150,
      pieSliceText: 'value',
      pieSliceTextStyle: { fontSize: 20 },
      colors: ['#4CAF50', 'gray'],
      chartArea: { width: '100%', height: '90%' },
      animation: { duration: 1000, easing: 'out', startup: true }
    }
  }),
  mounted () {
    console.log(this.$vuetify.breakpoint)
  },
  methods: {
    getResourceUsageAndRemain (type) {
      const using = this.resources[type].using
      const remain = this.resources[type].limit - using
      return { using, remain }
    }
  },
  computed: {
    instancesData () {
      let running = 0
      let pedning = 0
      let failed = 0
      if (this.instances) {
        running = this.instances.filter(v => v.status === 'Running').length
        pedning = this.instances.filter(v => v.status === 'Pending').length
        failed = this.instances.filter(v => v.status !== 'Running' && v.status !== 'Pending').length
      }

      return [
        ['Status', 'Number'],
        ['Running', running],
        ['Pending', pedning],
        ['Failed', failed]
      ]
    },
    volumesData () {
      let bound = 0
      let pedning = 0
      if (this.instances) {
        bound = this.volumes.filter(v => v.status === 'Bound').length
        pedning = this.volumes.filter(v => v.status === 'Pending').length
      }

      return [
        ['Status', 'Number'],
        ['Bound', bound],
        ['Pending', pedning]
      ]
    },
    cpusData () {
      const { using, remain } = this.getResourceUsageAndRemain('cpus')
      return [
        ['Usage', 'Number'],
        ['using', using],
        ['remain', remain]
      ]
    },
    memoryData () {
      const { using, remain } = this.getResourceUsageAndRemain('memory')
      return [
        ['Usage', 'Number'],
        ['using', using],
        ['remain', remain]
      ]
    },
    gpusData () {
      const { using, remain } = this.getResourceUsageAndRemain('gpus')
      return [
        ['Usage', 'Number'],
        ['using', using],
        ['remain', remain]
      ]
    },
    capacityData () {
      const { using, remain } = this.getResourceUsageAndRemain('capacity')
      return [
        ['Usage', 'Number'],
        ['using', using],
        ['remain', remain]
      ]
    }
  }
}
</script>
