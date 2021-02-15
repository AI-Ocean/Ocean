<template>
  <v-container grid-list-xs>
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        sm="6"
        xs="12"
        class="d-flex justify-center"
      >
        <v-img src="@/images/logo.svg" max-width="200" ></v-img>
      </v-col>
      <v-col
        sm="6"
        xs="12"
        class="d-flex align-center"
      >
        <sign-in v-if="isSignIn" @changeForm=changeForm />
        <sign-up v-else @changeForm=changeForm />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SignIn from '@/components/auth/signin'
import SignUp from '@/components/auth/signup'

export default {
  data: () => ({
    isSignIn: true
  }),
  methods: {
    changeForm () {
      this.isSignIn = !this.isSignIn
    }
  },
  components: {
    SignIn,
    SignUp
  }
}
</script>
