<template>
  <v-container grid-list-md flex>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-card
          width="1000px"
          color="#385F73"
          dark
        >
          <v-card-title>
            <span v-if="!isEditName" class="headline">{{ user.name }}</span>
            <div class="ma-0"><v-text-field v-model="editedName" v-if="isEditName" :rules="nameRules"></v-text-field></div>
            <v-icon small right text--secondary v-if="!isEditName" @click="editName">mdi-pencil-outline</v-icon>
            <v-icon small right text--secondary v-if="isEditName" @click="saveName">mdi-check-circle</v-icon>
            <v-icon small right text--secondary v-if="isEditName" @click="cancleName">mdi-close-circle</v-icon>
            <v-spacer></v-spacer>
            <span v-if="!user.activated">Not Activated. Request to Admin.</span>
          </v-card-title>
          <v-card-subtitle>
            {{ user.email }}<br />
            {{ user.role }}<br/>
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
                {{ user.gpus }}
              </v-avatar>
            </v-chip>
            <v-divider class="mt-4"></v-divider>
          </v-card-text>
          <v-card-actions>
            <v-btn color="lightgray" @click="changePassword">change password</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="d-flex justify-center">
        <quota-request>
        </quota-request>
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
  </v-container>

</template>

<script>
import { mapState } from 'vuex'
// import EditDataTable from '@/components/EditDataTable.vue'
import QuotaRequest from '../components/QuotaRequest.vue'

export default {
  components: { QuotaRequest },
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
    ]

  }),
  computed: {
    ...mapState({
      user: state => state.userStore.user
    }),
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
      await this.$axios.patch('/api/users/' + this.user._id, { name: this.editedName })
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
        await this.$store.dispatch('signIn', { email: this.user.email, password: this.curPassword })
      } catch (err) {
        err.message = 'Incorrect current password'
        throw err
      }
      // change password
      await this.$axios.patch('/api/users/' + this.user._id, { password: this.newPassword })
      this.$toasted.success('Password changed')
      this.editDialog = false
    },
    canclePassword () {
      this.curPassword = ''
      this.newPassword = ''
      this.passwordCheck = ''
      this.editDialog = false
    }

  },

  async mounted () {
    this.name = this.user.name
  }
}
</script>
