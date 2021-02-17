<template>
  <v-container grid-list-md flex>
    <v-row>
      <v-col>
        <v-card
          color="#385F73"
          dark
        >
          <!-- <div class="d-flex flex-no-wrap justify-space-between">
            <div> -->
              <v-card-title class="headline">{{ this.$store.state.user.name }}</v-card-title>
              <v-card-subtitle>
                {{ this.$store.state.user.email }}<br />
                {{ role }}
              </v-card-subtitle>
              <v-card-text>
                <v-divider class="mb-4"></v-divider>
                <!-- cips -->
                <!-- <v-chip
                  class="mr-2"
                  color="green"
                  text-color="white"
                >
                  CPUs
                  <v-avatar
                    left
                    class="ml-2 green darken-4"
                  >
                    {{ this.$store.state.user.name.cpus }}
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
                    {{ this.$store.state.user.mem }}
                  </v-avatar>
                </v-chip> -->
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
                <v-btn color="lightgray">edit profile</v-btn>
                <v-btn color="lightgray">request quota</v-btn>
              </v-card-actions>
            <!-- </div>
          </div> -->
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="editDialog"
      scrollable fullscreen
      persistent :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card>
        <v-card-title primary-title>
          title
        </v-card-title>
      </v-card>
    </v-dialog>
  </v-container>

</template>

<script>
export default {
  data: () => ({
    editDialog: true
  }),
  methods: {
  },
  computed: {
    role () {
      return this.$store.getters.isAdmin ? 'Admin' : 'User'
    }
  }
}
</script>
