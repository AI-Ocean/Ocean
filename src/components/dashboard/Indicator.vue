<template>
  <v-container fluid grid-list-md>
    <v-row>
      <v-col col="2" v-for="(item, i) in header" :key="item.title">
        <v-card>
          <v-toolbar :color="item.color" flat dark>
            <v-toolbar-title>
              {{ item.title }}
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ items[i].text }}
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Indicator',
  props: {
    header: Array,
    items: Array
  },
  data: () => ({
  }),
  methods: {
  },
  mounted () {
  }
}
</script>
