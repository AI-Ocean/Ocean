<template>
  <v-container fluid grid-list-md class="ma-0 pa-0">
    <v-row class="ma-0 pa-0">
      <v-col sm="12" md="4" class="ma-0 pa-1">
        <v-card tile>
          <v-toolbar flat dark>
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
      <v-col sm="12" md="8" class="ma-0 pa-1 pl-0">
        <v-card tile>
          <v-toolbar flat dark>
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
      backgroundColor: '#1E1E1E',
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
      backgroundColor: '#1E1E1E',
      colors: ['#4CAF50', 'gray', 'red'],
      chartArea: { width: '100%', height: '90%' },
      animation: { duration: 1000, easing: 'out', startup: true }
    }
  }),
  methods: {
    getChartData (type, onlyUsing = false) {
      const using = this.resources[type].using > this.resources[type].limit ? this.resources[type].limit : this.resources[type].using
      const remain = this.resources[type].limit > this.resources[type].using ? this.resources[type].limit - this.resources[type].using : 0
      const over = this.resources[type].using > this.resources[type].limit ? this.resources[type].using - this.resources[type].limit : 0

      return [
        ['Usage', 'Number'],
        ['using', using],
        ['remain', (onlyUsing ? 0 : remain)],
        ['over', (onlyUsing ? 0 : over)]
      ]
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
        pedning = this.volumes.filter(v => v.status === 'Pending' || v.status === 'Terminating').length
      }

      return [
        ['Status', 'Number'],
        ['Bound', bound],
        ['Pending', pedning]
      ]
    },
    cpusData () {
      return this.getChartData('cpus', this.$store.getters.level > 0)
    },
    memoryData () {
      return this.getChartData('memory', this.$store.getters.level > 0)
    },
    gpusData () {
      return this.getChartData('gpus')
    },
    capacityData () {
      return this.getChartData('capacity')
    }
  }
}
</script>
