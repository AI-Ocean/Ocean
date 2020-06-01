<template>
  <v-data-table
    :headers="headers"
    :items="data"
  >
    <template v-slot:top>
      <v-toolbar flat color="darken-1">
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="1000px">
          <template v-slot:activator="{ on }">
            <v-btn dark class="mb-2" v-on="on">New Item</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <slot name="dialog" :item="editedItem"></slot>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="close">Cancel</v-btn>
              <v-btn text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        small
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'EditDataTable',

  props: {
    title: String,
    headers: Array,
    data: Array,
    defaultItem: Object
  },

  data: () => ({
    dialog: false,
    editedItem: {},
    editedIndex: -1,
    menu: false
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    }
  },

  methods: {
    editItem (item) {
      this.editedIndex = this.data.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      const index = this.data.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.data.splice(index, 1) && this.$emit('delete', item)
    },

    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.data[this.editedIndex], this.editedItem)
        this.$emit('change', this.editedItem)
      } else {
        this.data.push(this.editedItem)
        this.$emit('add', this.editedItem)
      }
      this.close()
    }
  }
}
</script>
