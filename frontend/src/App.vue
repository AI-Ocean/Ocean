<template>
  <v-app>
    <div>
      <v-app-bar
        dark
        flat
        app
      >
        <v-app-bar-nav-icon v-if="$store.state.user && isMobile" @click="drawer = true"></v-app-bar-nav-icon>
        <v-toolbar-title>
          Ocean
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu offset-y v-if="$store.state.user">
          <template v-slot:activator="{ on }">
            <v-btn
              dark
              icon
              v-on="on"
            >
              <v-avatar
                size="40"
              >
                <img :src="$store.state.user.photoURL">
              </v-avatar>
            </v-btn>
          </template>
          <v-card>
            <v-container grid-list-md>
              <v-row>
                <v-col cols="4">
                  <v-avatar
                    size="100"
                  >
                    <img :src="$store.state.user.photoURL">
                  </v-avatar>
                </v-col>
                <v-col cols="8">
                  <v-card-text>
                    <span class="font-weight-bold">{{ $store.state.user.displayName }}</span>
                    <br>
                    <span class="font-weight-thin">{{ $store.state.user.email }}</span>
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
        v-if="$store.state.user"
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
          <v-list-item link to="/dashboard">
            <v-list-item-icon>
              <v-icon>mdi-monitor-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="$store.state.claims && $store.state.claims.level === 0" link to="/admin/users">
            <v-list-item-icon>
              <v-icon>mdi-account-group</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Users</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="$store.state.claims && $store.state.claims.level === 0" link to="/admin/settings">
            <v-list-item-icon>
              <v-icon>mdi-cog</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
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
      <vue-progress-bar/>
      <v-container v-if="!$store.state.firebaseLoaded" grid-list-md>
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
                Loading Authentication.
              </v-card-text>
            </v-card>
        </v-row>
      </v-container>
      <router-view/>
    </v-content>

    <v-footer>
      <v-spacer></v-spacer>
      &copy; {{ new Date().getFullYear() }} by MLVC Lab.
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    isMobile: false,
    drawer: false,
    items: [
      {
        text: 'Home',
        icon: 'mdi-home',
        to: '/'
      },
      {
        text: 'About',
        icon: 'mdi-information',
        to: '/about'
      }
    ]
  }),

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
      await this.$firebase.auth().signOut()
      this.$router.push('/sign')
    },
    toProfile () {
      this.$router.push('/profile')
    }
  }
}
</script>
