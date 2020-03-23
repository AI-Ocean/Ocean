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
        <v-img src="@/images/logo.png" max-width="200"></v-img>
      </v-col>
      <v-col
        sm="5"
        xs="12"
      >
        <sign-in @changeType="changeType" v-if="this.type"/>
        <sign-up @changeType="changeType" v-else/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SignIn from '@/components/auth/signin'
import SignUp from '@/components/auth/signup'

export default {
  data: () => ({
    type: true
  }),
  methods: {
    changeType () {
      this.type = !this.type
    }
  },
  components: {
    SignIn,
    SignUp
  }
}
</script>
