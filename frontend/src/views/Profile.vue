<template>
  <v-container grid-list-md flex>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-card
          width="800px"
          color="#385F73"
          dark
        >
          <!-- <div class="d-flex flex-no-wrap justify-space-between">
            <div> -->
              <v-card-title>
                <span v-if="!isEditName" class="headline">{{ name }}</span>
                <div class="ma-0"><v-text-field v-model="editedName" v-if="isEditName" :rules="nameRules"></v-text-field></div>
                <v-icon small right text--secondary v-if="!isEditName" @click="editName">mdi-pencil-outline</v-icon>
                <v-icon small right text--secondary v-if="isEditName" @click="saveName">mdi-check-circle</v-icon>
                <v-icon small right text--secondary v-if="isEditName" @click="cancleName">mdi-close-circle</v-icon>
              </v-card-title>
              <v-card-subtitle>
                {{ this.$store.state.user.email }}<br />
                {{ role }}
              </v-card-subtitle>
              <v-card-text>
                <v-divider class="mb-4"></v-divider>
                <v-chip
                  class="mr-2"
                  color="green"
                  text-color="white"
                >
                  GPUs
                  <v-avatar
                    left
                    class="ml-2 green darken-4"
                  >
                    {{ this.$store.state.user.gpus }}
                  </v-avatar>
                </v-chip>
                <v-divider class="mt-4"></v-divider>
              </v-card-text>
              <v-card-actions>
                <v-btn color="lightgray" @click="changePassword">change password</v-btn>
                <v-btn color="lightgray" @click="requestQuota">request quota</v-btn>
              </v-card-actions>
            <!-- </div>
          </div> -->
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="editDialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-card-title primary-title>
          Change Password
        </v-card-title>
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <v-text-field
              v-model="curPassword"
              label="Current Password"
              type="password"
              required
            ></v-text-field>
            <v-text-field
              v-model="newPassword"
              label="New Password"
              type="password"
              :rules="passwordRules"
              required
            ></v-text-field>
            <v-text-field
              v-model="passwordCheck"
              label="New Password Check"
              type="password"
              :rules="passwordCheckRules"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="success" :disabled="!valid" @click="savePassword">submit</v-btn>
          <v-btn @click="canclePassword">cancle</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="requestDialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-card-title primary-title>
          Request Quota
        </v-card-title>
        <v-card-text>
          <v-form
            v-model="quotaValid"
            lazy-validation
          >
            <v-text-field
              v-model="gpus"
              label="Request GPUs"
              type="number"
              suffix="Cores"
              required
            ></v-text-field>
            <v-menu
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="date"
                  label="Usage period"
                  :prefix="new Date().toISOString().substr(0, 10) + ' ~ '"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="date"
                @input="menu = false"
              ></v-date-picker>
            </v-menu>
            <v-text-field
              v-model="reason"
              label="Reason"
              type="text"
              hint="brief reason about this requesting"
              persistent-hint
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="success" :disabled="!quotaValid" @click="submitRequest">submit</v-btn>
          <v-btn @click="cancleRequest">cancle</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

</template>

<script>
export default {
  data: () => ({
    name: '',
    editedName: '',
    isEditName: false,
    nameRules: [
      v => !!v || 'Name is required',
      v => /^[A-Za-z0-9]+$/.test(v) || 'Name only contain alphabet and numbers'
    ],

    editDialog: false,
    valid: false,
    curPassword: '',
    newPassword: '',
    passwordCheck: '',
    passwordRules: [
      v => !!v || 'password is required',
      v => {
        const pattern = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
        return (
          pattern.test(v) ||
            'Min. 8 characters with at least a number and a special character.')
      }
    ],

    quotaValid: false,
    requestDialog: false,
    gpus: 0,
    reason: '',
    menu: false,
    date: new Date().toISOString().substr(0, 10)
  }),
  computed: {
    role () {
      return this.$store.getters.isAdmin ? 'Admin' : 'User'
    },
    passwordCheckRules () {
      return [() => (this.newPassword === this.passwordCheck) || 'Password must same']
    }
  },
  methods: {
    editName () {
      this.editedName = this.name
      this.isEditName = !this.isEditName
    },
    async saveName () {
      await this.$axios.patch('/api/users/' + this.$store.state.user._id, { name: this.editedName })
      this.name = this.editedName
      await this.$store.dispatch('getUserInfo')
      this.$toasted.success('Name changed')
      this.isEditName = !this.isEditName
    },
    cancleName () {
      this.isEditName = !this.isEditName
    },

    changePassword () {
      this.editDialog = true
    },
    async savePassword () {
      // Re-signin
      try {
        await this.$store.dispatch('signIn', { email: this.$store.state.user.email, password: this.curPassword })
      } catch (err) {
        err.message = 'Incorrect current password'
        throw err
      }
      // change password
      await this.$axios.patch('/api/users/' + this.$store.state.user._id, { password: this.newPassword })
      this.$toasted.success('Password changed')
      this.editDialog = false
    },
    canclePassword () {
      this.curPassword = ''
      this.newPassword = ''
      this.passwordCheck = ''
      this.editDialog = false
    },

    requestQuota () {
      this.gpus = this.$store.state.user.gpus
      this.reason = ''
      this.requestDialog = true
    },
    submitRequest () {
      // TODO
      this.requestDialog = false
    },
    cancleRequest () {
      this.requestDialog = false
    }
  },
  mounted () {
    this.name = this.$store.state.user.name
  }
}
</script>
