<template>
  <v-card color="transparent" width="500" flat>
    <v-card-title primary-title>
      <span class="title">Sign In</span>
    </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-text-field
          v-model="email"
          name="email"
          label="E-mail"
          :rules="emailRules"
          required
        ></v-text-field>
        <v-text-field
          v-model="password"
          name="password"
          label="Password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          required
          @click:append="showPassword = !showPassword"
        ></v-text-field>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <!-- <v-spacer></v-spacer> -->
      <v-btn color="primary" block dark @click="siginIn">Sign In</v-btn>
      <!-- <v-btn color="primary" block @click="signInWithGoogle">
        <v-icon dark>mdi-google</v-icon>
        <v-divider vertical class="mx-3"></v-divider>
        <v-spacer></v-spacer>
        Signin with Google Account
        <v-spacer></v-spacer>
      </v-btn> -->
    </v-card-actions>
    <v-card-text>
      <span>Don't have an account yet? &nbsp;<a @click="$emit('changeForm')">Register now</a></span>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    email: '',
    password: '',
    showPassword: false,
    valid: false,
    // remember: false,

    emailRules: [
      v => !!v || 'E-mail is required',
      v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    ]
  }),
  methods: {
    // async signInWithGoogle () {
    //   const provider = new this.$firebase.auth.GoogleAuthProvider()
    //   await this.$firebase.auth().signInWithPopup(provider)
    //   const user = this.$firebase.auth().currentUser
    //   await user.getIdToken()
    //   await this.$store.dispatch('getUser', user)

    //   // just after signup or guest
    //   if (this.$store.state.claims.level === undefined || this.$store.state.claims.level >= 2) {
    //     // user email is not khu.ac.kr domain
    //     if (user.email.split('@')[1] !== 'khu.ac.kr') {
    //       alert('Only KHU member allowd!')
    //       await user.delete()
    //     } else {
    //       alert('Please wait for administrator approval.')
    //       await this.$firebase.auth().signOut()
    //     }
    //   }
    //   this.$router.push('/')
    // }
    async siginIn () {
      try {
        await this.$store.dispatch('signIn', { email: this.email, password: this.password })
      } catch (e) {
        e.message = 'Login failed'
        throw e
      }
      this.$router.push('/')
    }
  }
}
</script>
