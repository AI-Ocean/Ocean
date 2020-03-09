<template>
  <v-container fluid grid-list-md>
    <v-row>
      <v-col xs12>
        <v-toolbar color="primary">
          axios eg
        </v-toolbar>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" xs="6" v-for="item in items" :key="item.method">
        <v-card>
          <v-card-title primary-title>
            {{ item.method }}
          </v-card-title>
          <v-card-text>
            <v-textarea
              v-model="item.model"
              rows="5"
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="http(item.method)">submit</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    items: [
      {
        method: 'create',
        model: ''
      },
      {
        method: 'update',
        model: ''
      },
      {
        method: 'read',
        model: ''
      },
      {
        method: 'delete',
        model: ''
      }
    ],
    textCreate: ''
  }),
  methods: {
    async http (type) {
      console.log(type)
      if (type === 'create') {
        const r = await this.$axios.post('test')
        this.items[0].model = r.data
      } else if (type === 'update') {
        this.$axios.put('test/123')
          .then(r => {
            this.items[1].model = r.data
          })
          .catch(e => console.error(e))
      } else if (type === 'read') {
        this.$axios.get('test/123')
          .then(r => {
            this.items[2].model = r.data
          })
          .catch(e => console.error(e))
      } else if (type === 'delete') {
        this.$axios.delete('test/123')
          .then(r => {
            this.items[3].model = r.data
          })
          .catch(e => console.error(e))
      }
    }
  }
}
</script>
