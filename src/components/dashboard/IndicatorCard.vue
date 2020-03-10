<template>
  <v-card>
    <v-toolbar :color="color" flat dark>
      <v-toolbar-title>
        {{ title }}
      </v-toolbar-title>
    </v-toolbar>
    <v-card-title primary-title>
      {{ text }}
    </v-card-title>
  </v-card>
</template>

<script>
export default {
  name: 'IndicatorCard',
  props: {
    title: { type: String },
    color: { type: String },
    text: { type: String }
  }
}
</script>
