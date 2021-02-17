<template>
  <v-card color="transparent" width="500" flat>
    <v-card-title primary-title>
      <span class="title">Sign Up</span>
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
          label="Password"
          type="password"
          :rules="passwordRules"
          required
        ></v-text-field>
        <v-text-field
          v-model="passwordCheck"
          label="Password Check"
          type="password"
          :rules="passwordCheckRules"
          required
        ></v-text-field>
        <v-text-field
          v-model="name"
          label="name"
          :rules="nameRules"
          required
        ></v-text-field>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-btn color="primary" block dark @click="siginUp">Register</v-btn>
    </v-card-actions>
    <v-card-text>
      <span>Already have an account? &nbsp;<a @click="$emit('changeForm')">Sign in now</a></span>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    email: '',
    password: '',
    passwordCheck: '',
    name: '',
    valid: false,

    emailRules: [
      v => !!v || 'E-mail is required',
      v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    ],
    passwordRules: [
      v => !!v || 'E-mail is required',
      v => {
        const pattern = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
        return (
          pattern.test(v) ||
            'Min. 8 characters with at least a number and a special character.')
      }
    ],
    nameRules: [
      v => !!v || 'Name is required',
      v => /^[A-Za-z0-9]+$/.test(v) || 'Name only contain alphabet and numbers'
    ]
  }),
  computed: {
    passwordCheckRules () {
      return [() => (this.password === this.passwordCheck) || 'Password must same']
    }
  },
  methods: {
    async siginUp () {
      try {
        await this.$axios.post('/api/signup',
          {
            email: this.email,
            password: this.password,
            name: this.name
          })
      } catch (err) {
        if (err.response.status === 400) {
          throw new Error('Same email already exist')
        } else {
          throw err
        }
      }
      this.$toasted.success('Register Success!')
      this.$emit('changeForm')
    }
  }
}
</script>
