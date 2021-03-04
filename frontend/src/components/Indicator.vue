<template>
  <v-container fluid grid-list-md class="ma-0 pa-0">
    <v-row class="ma-0 pa-0">
      <v-col sm="12" md="6" class="ma-0 pa-1">
        <v-card tile>
          <v-toolbar flat dark>
            <v-toolbar-title>
              Workloads Status
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text pa-0>
            <v-container fluid pa-0>
              <v-row pa-0>
                <v-col pa-0 cols="4">
                  <GChart
                    type="PieChart"
                    :data="instancesData"
                    :options="chartOptions"
                    :resizeDebounce="10"
                  ></GChart>
                  <p class='title text-center mt-2 ma-0'>Instances</p>
                </v-col>
                <v-col pa-0 cols="4">
                  <GChart
                    type="PieChart"
                    :data="jobsData"
                    :options="chartOptions"
                    :resizeDebounce="10"
                  ></GChart>
                  <p class='title text-center mt-2 ma-0'>Jobs</p>
                </v-col>
                <v-col pa-0 cols="4">
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
      <v-col sm="12" md="6" class="ma-0 pa-1 pl-0">
        <v-card tile>
          <v-toolbar flat dark>
            <v-toolbar-title>
              Resources Status
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
import { mapGetters } from 'vuex'

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
      colors: ['#4CAF50', '#FF9800', '#F44336', 'gray'],
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
      colors: ['#4CAF50', 'gray', 'red', 'gray'],
      chartArea: { width: '100%', height: '90%' },
      animation: { duration: 1000, easing: 'out', startup: true }
    }
  }),
  methods: {
    getChartData (type, onlyUsing = false) {
      let using = this.resources[type].using // > this.resources[type].limit ? this.resources[type].limit : this.resources[type].using
      let remain = this.resources[type].limit > this.resources[type].using ? this.resources[type].limit - this.resources[type].using : 0
      let over = this.resources[type].using > this.resources[type].limit ? this.resources[type].using - this.resources[type].limit : 0

      if ((type === 'capacity') && (using > 1000 || remain > 1000 || over > 1000)) {
        using /= 1000
        remain /= 1000
        over /= 1000
      }

      return [
        ['Usage', 'Number'],
        ['using', using],
        ['remain', (onlyUsing ? 0 : remain)],
        ['over', (onlyUsing ? 0 : over)],
        ['no data', (using + remain + over) === 0 ? 0.00001 : 0]
      ]
    }
  },
  computed: {
    ...mapGetters([
      'isAdmin'
    ]),

    instancesData () {
      let running = 0
      let pedning = 0
      let failed = 0
      let no = 0
      if (this.instances) {
        running = this.instances.filter(v => v.status === 'Running').length
        pedning = this.instances.filter(v => v.status === 'Pending').length
        failed = this.instances.filter(v => v.status !== 'Running' && v.status !== 'Pending').length
      }
      if (running + pedning + failed === 0) no = 1

      return [
        ['Status', 'Number'],
        ['Running', running],
        ['Pending', pedning],
        ['Failed', failed],
        ['No Instances', no]
      ]
    },
    jobsData () {
      let running = 0
      let pedning = 0
      let failed = 0
      let no = 0
      if (this.jobs) {
        running = this.jobs.filter(v => v.status === 'Running').length
        pedning = this.jobs.filter(v => v.status === 'Pending').length
        failed = this.jobs.filter(v => v.status !== 'Running' && v.status !== 'Pending').length
      }
      if (running + pedning + failed === 0) no = 1

      return [
        ['Status', 'Number'],
        ['Running', running],
        ['Pending', pedning],
        ['Failed', failed],
        ['No Jobs', no]
      ]
    },
    volumesData () {
      let bound = 0
      let pedning = 0
      let no = 0
      if (this.instances) {
        bound = this.volumes.filter(v => v.status === 'Bound').length
        pedning = this.volumes.filter(v => v.status === 'Pending' || v.status === 'Terminating').length
      }
      if (bound + pedning === 0) no = 1

      return [
        ['Status', 'Number'],
        ['Bound', bound],
        ['Pending', pedning],
        ['', 0],
        ['No Volumes', no]
      ]
    },
    cpusData () {
      return this.getChartData('cpus', this.isAdmin)
    },
    memoryData () {
      return this.getChartData('memory', this.isAdmin)
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
