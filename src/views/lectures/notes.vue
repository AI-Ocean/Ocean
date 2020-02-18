<template>
  <v-container fluid>
    <v-data-iterator
      :items="items"
      :items-per-page.sync="itemsPerPage"
      :page="page"
      hide-default-footer
    >
      <template v-slot:header>
        <v-row>
          <v-col xs6>
            <v-text-field
              v-model="title"
              label="title"
              clearable
            ></v-text-field>
          </v-col>
          <v-col xs6>
            <v-text-field
              v-model="content"
              label="content"
              clearable
            ></v-text-field>
          </v-col>
          <v-col xs6>
            <v-btn color="success" @click="post">Add</v-btn>
          </v-col>
        </v-row>
      </template>

      <template v-slot:default="props">
        <v-row>
          <v-col
            v-for="item in props.items"
            :key="item.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card>
              <v-card-title class="subheading font-weight-bold">{{ item.title }}</v-card-title>

              <v-divider></v-divider>

              <v-card-text>
                {{ item.content }}
              </v-card-text>

              <v-card-text>
                {{ item.id }}
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="put(item.id)">Put</v-btn>
                <v-btn @click="del(item.id)">Del</v-btn>
              </v-card-actions>

            </v-card>
          </v-col>
        </v-row>
      </template>

      <template v-slot:footer>
        <v-row class="mt-2" align="center" justify="center">
          <span class="grey--text">Items per page</span>
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn
                dark
                text
                color="primary"
                class="ml-2"
                v-on="on"
              >
                {{ itemsPerPage }}
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(number, index) in itemsPerPageArray"
                :key="index"
                @click="updateItemsPerPage(number)"
              >
                <v-list-item-title>{{ number }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-spacer></v-spacer>

          <span
            class="mr-4
            grey--text"
          >
            Page {{ page }} of {{ numberOfPages }}
          </span>
          <v-btn
            text
            icon
            depressed
            small
            @click="formerPage"
          >
            <v-icon>mdi-menu-left</v-icon>
          </v-btn>
          <v-btn
            text
            icon
            depressed
            small
            @click="nextPage"
          >
            <v-icon>mdi-menu-right</v-icon>
          </v-btn>
        </v-row>
      </template>
    </v-data-iterator>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    // page
    itemsPerPageArray: [2, 4, 6],
    page: 1,
    itemsPerPage: 2,
    // items
    items: [],
    title: '',
    content: ''
  }),
  mounted () {
    this.get()
  },
  computed: {
    numberOfPages () {
      return Math.ceil(this.items.length / this.itemsPerPage)
    }
  },
  methods: {
    // pages
    nextPage () {
      if (this.page + 1 <= this.numberOfPages) this.page += 1
    },
    formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
    },
    updateItemsPerPage (number) {
      this.itemsPerPage = number
    },
    // notes
    async post () {
      await this.$firebase.firestore().collection('notes').add({
        title: this.title,
        content: this.content
      })
      this.title = ''
      this.content = ''
    },
    async get () {
      this.items = []

      const snapshot = await this.$firebase.firestore().collection('notes').get()
      snapshot.forEach(v => {
        const { title, content } = v.data()
        this.items.push({
          title, content, id: v.id
        })
      })
      console.log(this.items)
    },
    async put (id) {
      console.log(id)
      await this.$firebase.firestore().collection('notes').doc(id).set({
        title: this.title,
        content: this.content
      })
      await this.get()
    },
    async del (id) {
      console.log(id)
      await this.$firebase.firestore().collection('notes').doc(id).delete()
      await this.get()
    }
  }
}
</script>
