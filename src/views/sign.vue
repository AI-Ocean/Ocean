<template>
  <v-card>
    <v-card-title primary-title>
      SignIn
    </v-card-title>
    <v-card-text>
      <v-text-field
        label="email"
        v-model="email"
      ></v-text-field>
      <v-text-field
        label="password"
        v-model="password"
        type="password"
      ></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" dark @click="signInWithGoogle">
        <v-icon>mdi-google</v-icon>
        Login with Google
      </v-btn>
      <v-btn color="primary" dark @click="signInWithEmail(email, password)">
        <v-icon>mdi-email</v-icon>
        Login with Email
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    email: '',
    password: ''
  }),
  methods: {
    async signInWithGoogle () {
      var provider = new this.$firebase.auth.GoogleAuthProvider()
      const r = await this.$firebase.auth().signInWithPopup(provider)
      console.log(r)
    },
    async signInWithEmail (email, password) {
      const r = await this.$firebase.auth().createUserWithEmailAndPassword(email, password)
      console.log(r)
    }
  }
}
</script>
