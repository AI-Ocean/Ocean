<template>
  <v-card color="transparent" height="500" flat>
    <v-card-title primary-title>
      <span class="title">SignIn</span>
    </v-card-title>
    <v-card-actions>
      <v-btn color="primary" block @click="signInWithGoogle">
        <v-icon dark>mdi-google</v-icon>
        <v-divider vertical class="mx-3"></v-divider>
        <v-spacer></v-spacer>
        Signin with Google Account
        <v-spacer></v-spacer>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data: () => ({
  }),
  methods: {
    async signInWithGoogle () {
      const provider = new this.$firebase.auth.GoogleAuthProvider()
      await this.$firebase.auth().signInWithPopup(provider)
      const user = this.$firebase.auth().currentUser
      await user.getIdToken()
      await this.$store.dispatch('getUser', user)

      // just after signup or guest
      if (this.$store.state.claims.level === undefined || this.$store.state.claims.level >= 2) {
        // user email is not khu.ac.kr domain
        if (user.email.split('@')[1] !== 'khu.ac.kr') {
          alert('Only KHU member allowd!')
          await user.delete()
        } else {
          alert('Please wait for administrator approval.')
          await this.$firebase.auth().signOut()
        }
      }
      this.$router.push('/')
    }
  }
}
</script>
