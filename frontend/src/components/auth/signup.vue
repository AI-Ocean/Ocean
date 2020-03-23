<template>
  <v-card color="transparent" height="500" flat>
    <v-form v-model="valid" ref="form" lazy-validation>
      <v-card-title primary-title>
        <span class="title">SignUp</span>
        <v-spacer></v-spacer>
        <span class="caption">or</span>
        <a class="caption ml-1" @click="$emit('changeType')">SignIn</a>
      </v-card-title>
      <v-card-actions>
        <v-btn color="primary" block @click="signUpWithGoogle">
          <v-icon dark>mdi-google</v-icon>
          <v-divider vertical class="mx-3"></v-divider>
          Signup with Google Account
        </v-btn>
      </v-card-actions>
      <v-container grid-list-md fluid>
        <v-row
          align="center"
          justify="center"
        >
          <v-col cols="5" xs="5">
            <v-divider></v-divider>
          </v-col>
          <v-col cols="2" xs="2" align="center">
            or
          </v-col>
          <v-col cols="5" xs="5">
            <v-divider></v-divider>
          </v-col>
        </v-row>
      </v-container>
      <v-card-text>
        <v-text-field
          label="name"
          v-model="form.name"
          :rules="[rule.required, rule.maxLength(20), rule.minLength(5)]"
          required
        ></v-text-field>
        <v-text-field
          label="email"
          v-model="form.email"
          :rules="[rule.required, rule.email]"
          required
        ></v-text-field>
        <v-text-field
          label="password"
          type="password"
          v-model="form.password"
          :rules="[rule.required, rule.minLength(6)]"
          required
        ></v-text-field>
        <div class="recaptcha-terms-text">
        이 페이지는 reCAPTCHA로 보호되며, Google 개인정보처리방침 및 서비스 약관의 적용을 받습니다.
        </div>
      </v-card-text>
      <v-card-actions>
        <v-checkbox
          label="Agree With SignUp"
          v-model="agree"
          :rules="[rule.agree]"
          required
        ></v-checkbox>
        <v-spacer></v-spacer>
        <!-- <v-btn color="primary" :disabled="!valid" @click="signUpWithEmail">SignUp</v-btn> -->
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    valid: true,
    saveInfo: false,
    form: {
      name: '',
      email: '',
      password: ''
    },
    agree: false,
    rule: {
      required: v => !!v || 'Required Item.',
      minLength: length => v => v.length > length || `Min ${length} characters.`,
      maxLength: length => v => v.length <= length || `Max ${length} characters.`,
      email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return pattern.test(value) || 'Invalid e-mail.'
      },
      agree: v => !!v || 'Agree to the terms.'
    }
  }),
  methods: {
    async signUpWithGoogle () {
      const provider = new this.$firebase.auth.GoogleAuthProvider()
      await this.$firebase.auth().signInWithPopup(provider)
      await this.$firebase.auth().signOut()
      this.$emit('changeType')
    }
  }
}
</script>

<style scoped>
.recaptcha-terms-text {
  font-size: 12px;
  font-weight: 200;
  color: #637282;
}
</style>
