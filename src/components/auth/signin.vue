<template>
  <v-card color="transparent" height="500" flat>
    <v-form v-model="valid" ref="form" lazy-validation>
      <v-card-title primary-title>
        <span class="title">SignIn</span>
        <v-spacer></v-spacer>
        <span class="caption">or</span>
        <a class="caption ml-1" @click="$emit('changeType')">SignUp</a>
      </v-card-title>
      <v-card-actions>
        <v-btn color="primary" block @click="signInWithGoogle">
          <v-icon dark>mdi-google</v-icon>
          <v-divider vertical class="mx-3"></v-divider>
          Signin with Google Account
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
          label="email"
        ></v-text-field>
        <v-text-field
          label="password"
          type="password"
        ></v-text-field>
        <div class="recaptcha-terms-text">
        이 페이지는 reCAPTCHA로 보호되며, Google 개인정보처리방침 및 서비스 약관의 적용을 받습니다.
        </div>
      </v-card-text>
      <v-card-actions>
        <v-checkbox
          label="Save SignIn Info"
          v-model="saveInfo"
          value="value"
        >
        </v-checkbox>
        <v-spacer></v-spacer>
        <v-btn color="primary">SignIn</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    valid: true,
    saveInfo: false,
    email: '',
    password: ''
  }),
  methods: {
    async signInWithGoogle () {
      const provider = new this.$firebase.auth.GoogleAuthProvider()
      await this.$firebase.auth().signInWithPopup(provider)
      const user = this.$firebase.auth().currentUser
      await user.getIdToken()
      await this.$store.dispatch('getUser', user)
      if (this.$store.state.claims.level === undefined) {
        return this.$router.push('/profile')
      }
      this.$router.push('/')
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
