<template>
  <v-app>
    <div>
      <v-app-bar dark flat app class="grey darken-3">
        <v-app-bar-nav-icon v-if="user && isMobile" @click="drawer = true"></v-app-bar-nav-icon>
        <v-toolbar-title>
          Ocean
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <v-menu offset-y v-if="user">
          <template v-slot:activator="{ on }">
            <v-btn dark icon v-on="on">
              <v-badge
                content="1"
                value="1"
                color="green"
                overlap
              >
                <v-icon>mdi-bell-outline</v-icon>
              </v-badge>
            </v-btn>
          </template>
          <v-card>
            <!-- <v-card-text> -->
              <v-list>
                <v-list-item>
                  <v-list-item-subtitle>Notifications</v-list-item-subtitle>
                </v-list-item>
                <v-list-item link>
                  <v-list-item-title>
                    Job 'job-test-1' is finished.
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            <!-- </v-card-text> -->
          </v-card>
        </v-menu>
        <div>
        </div>
        <v-menu offset-y v-if="user">
          <template v-slot:activator="{ on }">
            <v-btn dark icon v-on="on">
              <v-avatar size="45" color="blue">
                <span class="white--text headline">{{ user.name.substring(0,2).toUpperCase() }}</span>
              </v-avatar>
            </v-btn>
          </template>
          <v-card>
            <v-container grid-list-md>
              <v-row>
                <v-col cols="4">
                  <v-avatar size="80" color="blue">
                    <span class="white--text" style="font-size: 40px">{{ user.name.substring(0,2).toUpperCase() }}</span>
                  </v-avatar>
                </v-col>
                <v-col cols="8">
                  <v-card-text>
                    <span class="font-weight-bold title">{{ user.name }}</span><br>
                    <span class="font-weight-thin subtitle">{{ user.email }}</span>
                  </v-card-text>
                </v-col>
              </v-row>
            </v-container>
            <v-divider></v-divider>
            <v-card-actions>
              <v-btn @click="toProfile">View Profile</v-btn>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="signOut">SignOut</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        v-if="user"
        app
        mini-variant-width="56"
        :permanent="!isMobile"
        :expand-on-hover="!isMobile"
      >
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <img src="@/images/logo.svg">
          </v-list-item-avatar>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">
              Ocean
            </v-list-item-title>
            <v-list-item-subtitle>
              GPU Management System
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list>
          <v-list-item link to="/">
            <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>

          <v-list-item link to="/jobs">
            <v-list-item-icon>
              <v-icon>mdi-rocket-launch</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Jobs</v-list-item-title>
          </v-list-item>
          <v-list-item link to="/instances">
            <v-list-item-icon>
              <v-icon>mdi-server</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Instances</v-list-item-title>
          </v-list-item>
          <v-list-item link to="/volumes">
            <v-list-item-icon>
              <v-icon>mdi-database</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Volumes</v-list-item-title>
          </v-list-item>
          <!-- <v-list-item link to="/services">
            <v-list-item-icon>
              <v-icon>mdi-access-point-network</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Services</v-list-item-title>
          </v-list-item> -->
        <v-divider></v-divider>

          <template v-if="user.role === 'admin'">
            <v-list-item link to="/admin/users">
              <v-list-item-icon>
                <v-icon>mdi-account-group</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Users</v-list-item-title>
            </v-list-item>
            <v-list-item link to="/admin/settings">
              <v-list-item-icon>
                <v-icon>mdi-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
          </template>

          <v-list-item link to="/about">
            <v-list-item-icon>
              <v-icon>mdi-information</v-icon>
            </v-list-item-icon>
            <v-list-item-title>About</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </div>

    <v-content>
      <router-view></router-view>
    </v-content>

    <v-footer>
      <v-spacer></v-spacer>
      &copy; 2019-{{ new Date().getFullYear() }} by kairos03.
    </v-footer>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
// const userStore = 'userStore'

export default {
  name: 'App',
  data: () => ({
    isMobile: false,
    drawer: false
  }),
  computed: {
    ...mapState({
      user: state => state.userStore.user
    })
  },

  beforeDestroy () {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize, { passive: true })
    }
  },

  mounted () {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
  },

  methods: {
    onResize () {
      this.isMobile = window.innerWidth < 600
    },
    async signOut () {
      this.$store.dispatch('signOut')
      this.$router.push('/sign')
    },
    toProfile () {
      this.$router.push('/profile')
    }
  }
}
</script>
