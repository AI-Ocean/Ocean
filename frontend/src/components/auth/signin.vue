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
          @keyup.enter="siginIn"
        ></v-text-field>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-btn color="primary" block dark @click="siginIn">Sign In</v-btn>
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
