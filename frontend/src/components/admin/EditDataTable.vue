<template>
  <v-data-table
    :headers="headers"
    :items="data"
    :options.sync="defaultOptions"
    :footerProps="footerProps"
    :loading="loading"
  >
    <template v-slot:top>
      <v-toolbar flat color="transparent" >
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="700px">
          <template v-if="defaultOptions.add" v-slot:activator="{ on }">
            <v-btn dark icon v-on="on">
              <v-icon>mdi-plus-box</v-icon>
            </v-btn>
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
        <v-dialog v-model="deleteDialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">Delete Item</span>
            </v-card-title>

            <v-card-text>
              <slot name="deleteDialog" :item="editedItem"> Are you sure to delete <code>{{editedItem}}</code> </slot>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="closeDelete">Cancel</v-btn>
              <v-btn text @click="confirmDelete">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-for="info in headers" v-slot:[`item.${info.value}`]="{ item }">
      <slot :name="`${info.value}`" v-bind:item="item">{{item[`${info.value}`]}}</slot>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon
        v-if="defaultOptions.edit"
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        v-if="defaultOptions.delete"
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
    loading: Boolean,
    options: Object,
    footerProps: Object,
    headers: Array,
    data: Array,

    title: String,
    defaultItem: Object
  },

  data: () => ({
    dialog: false,
    deleteDialog: false,
    editedItem: {},
    editedIndex: -1,
    defaultOptions: {
      add: true,
      edit: true,
      delete: true
    }
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? `New ${this.title}` : `Edit ${this.title}`
    }
  },

  methods: {
    initDialogs () {
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    editItem (item) {
      this.editedIndex = this.data.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    close () {
      this.dialog = false
      this.initDialogs()
      this.$emit('close')
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
    },

    deleteItem (item) {
      this.editedIndex = this.data.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.deleteDialog = true
    },

    closeDelete () {
      this.deleteDialog = false
      this.initDialogs()
    },

    confirmDelete () {
      this.data.splice(this.editedIndex, 1)
      this.$emit('delete', this.editedItem)
      this.closeDelete()
    }
  },
  mounted () {
    Object.assign(this.defaultOptions, this.options)
  }
}
</script>
