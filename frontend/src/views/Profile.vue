<template>
  <v-container grid-list-md flex>
    <v-row>
      <v-col>
        <v-card
          color="#385F73"
          dark
        >
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-title class="headline">{{ userData.displayName }}</v-card-title>
              <v-card-subtitle>
                {{ userData.email }}<br />
                {{ role }}
              </v-card-subtitle>
              <v-card-text>
                <v-divider class="mb-4"></v-divider>
                <!-- cips -->
                <v-chip
                  class="mr-2"
                  color="green"
                  text-color="white"
                >
                  CPUs
                  <v-avatar
                    left
                    class="ml-2 green darken-4"
                  >
                    {{ userData.cpus }}
                  </v-avatar>
                </v-chip>
                <v-chip
                  class="mr-2"
                  color="green"
                  text-color="white"
                >
                  Memory
                  <v-avatar
                    left
                    class="ml-2 green darken-4"
                  >
                    {{ userData.mem }}
                  </v-avatar>
                </v-chip>
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
                    {{ userData.gpus }}
                  </v-avatar>
                </v-chip>
              </v-card-text>
            </div>
            <v-avatar
              class="ma-3"
              size="125"
              tile
            >
              <v-img :src="this.userData.photoURL"></v-img>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-content>
      <vue-progress-bar/>
      <v-container grid-list-md v-if="!userData">
        <v-row align="center" justify="center">
            <v-card color="transparent" flat>
              <v-card-text class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  class="text-center"
                ></v-progress-circular>
              </v-card-text>
              <v-card-text class="text-center">
                Loading User Prifile.
              </v-card-text>
            </v-card>
        </v-row>
      </v-container>
    </v-content>

  </v-container>

</template>

<script>
export default {
  data: () => ({
    userData: {}
  }),
  methods: {
    async getUserInfo () {
      const r = await this.$axios.get('/api/users/' + this.$store.state.user.uid)
      this.userData = r.data
    }
  },
  mounted () {
    this.getUserInfo()
  },
  computed: {
    role () {
      return this.userData.level <= 0 ? 'Admin' : this.userData.level <= 1 ? 'User' : 'Guest'
    }
  }
}
</script>
