<template>
  <v-container grid-list-xs>
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        sm="5"
        xs="12"
      >
        <v-img src="@/images/logo.svg" max-width="200"></v-img>
      </v-col>
      <v-col
        sm="5"
        xs="12"
      >
        <sign-in />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SignIn from '@/components/auth/signin'

export default {
  data: () => ({
  }),
  methods: {
  },
  components: {
    SignIn
  }
}
</script>
