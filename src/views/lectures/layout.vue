<template>
  <v-container fluid grid-list-md>
    <v-row fluid>
      <v-col md6 lg4 v-for="i in 10" :key="i">
        <v-card>
          <v-card-title color="red" primary-title>
            Cards
          </v-card-title>
          <v-card-text>
            teststestetsetsetsetsetestses
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
