<template>
  <v-data-table
    v-model="selected"
    item-key="name"
    :headers="headers"
    :items="data"
    :options.sync="defaultOptions"
    :footerProps="footerProps"
    :loading="loading"
    :show-select="showSelect"
  >
    <template v-slot:top>
      <v-toolbar flat color="transparent" >
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="700px">
          <template v-slot:activator="{ on }">
            <v-btn v-if="defaultOptions.create" dark icon v-on="on">
              <v-icon>mdi-plus-box</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-form ma-4 ref="form" v-model="valid">
                <slot name="dialog" :index="editedIndex" :item="editedItem"></slot>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="close">Cancel</v-btn>
              <v-btn text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-btn v-if="defaultOptions.copy" dark icon @click="copyItem(selected[0])" :disabled="selected.length !== 1">
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
        <v-dialog v-model="deleteDialog" max-width="500px">
          <template v-if="defaultOptions.deleteTop" v-slot:activator="{ on }">
            <v-btn dark icon v-on="on" :disabled="selected.length <= 0">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">Delete Item</span>
            </v-card-title>

            <v-card-text>
              <slot name="deleteDialog" :index="editedIndex" :item="editedItem" :selected="selected">
                Are you sure to delete:
                <template v-if="selected.length > 0">
                  <div v-for="(item) in selected" :key="item.name">
                    <code>{{item.name}}</code>
                  </div>
                </template>
                <template v-else-if="editedItem">
                  <code>{{editedItem.name}}</code>
                </template>
              </slot>
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
      <slot name="action" v-bind:item="item" :updateItem="editItem" :deleteItem="deleteItem">
        <v-icon
          v-if="defaultOptions.update"
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
      </slot>
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
    showSelect: Boolean,

    copyItemPreprocess: Array,

    title: String,
    defaultItem: Object
  },

  data: () => ({
    dialog: false,
    valid: false,
    deleteDialog: false,
    selected: [],
    editedItem: {},
    editedIndex: -1,
    defaultOptions: {
      create: true,
      update: true,
      delete: true,
      deleteTop: false,
      copy: false
    }
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? `New ${this.title}` : `Edit ${this.title}`
    }
  },

  methods: {
    initDialogs () {
      this.editedItem = Object.assign({}, this.defaultItem)
      this.editedIndex = -1
      this.selected = []
    },

    editItem (item) {
      this.editedIndex = this.data.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    copyItem (item) {
      let newItem = this.copyItemPreprocess[0](item)
      this.editedIndex = -1
      this.editedItem = Object.assign({}, newItem)
      this.dialog = true
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.initDialogs()
        this.$refs.form.resetValidation()
        this.$emit('close')
      }, 100)
    },

    save () {
      this.$refs.form.validate()
      if (!this.valid) {
        return
      }
      if (this.editedIndex > -1) {
        this.$emit('update', this.editedItem)
      } else {
        this.$emit('create', this.editedItem)
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
      if (this.selected.length > 0) {
        this.selected.forEach(v => this.$emit('delete', v))
      } else {
        this.$emit('delete', this.editedItem)
      }
      this.closeDelete()
    }
  },
  mounted () {
    Object.assign(this.defaultOptions, this.options)
    this.initDialogs()
  }
}
</script>
