<template>
  <v-app>
    <div>
      <v-app-bar
        color="deep-purple"
        dark
        flat
      >
        <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>

        <v-toolbar-title>Title</v-toolbar-title>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        absolute
        temporary
      >
        <v-list>
          <v-list-item link>
            <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>

          <v-list-group
            prepend-icon="mdi-account-circle"
            no-action
          >
            <template v-slot:activator>
              <v-list-item-title>Users</v-list-item-title>
            </template>
            <v-list-item
              link
              >
              <v-list-item-title>Admin</v-list-item-title>
              <v-list-item-icon>
                <v-icon>mdi-account-group</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-group>

        </v-list>
      </v-navigation-drawer>
    </div>

    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
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
      },
      {
        text: 'About2',
        icon: 'mdi-information',
        to: '/about2'
      }
    ]
  }),
  methods: {

  }
}
</script>
