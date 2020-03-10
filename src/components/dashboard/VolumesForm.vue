<template>
  <v-card>
    <v-card-title>
      {{ this.title }}
    </v-card-title>
    <v-card-text>
      <v-form
        ma-4
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-text-field
          v-model.trim="name"
          counter="30"
          :prefix="getPrefix"
          :rules="this.name_rules"
          label="Name"
          required
        >
        </v-text-field>
        <v-text-field
          v-model.number="capacity"
          :rules="this.cap_rules"
          type="number"
          label="Capacity"
          suffix=" Gi"
          required
        >
        </v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="gray" @click="cancle">
        Cancle
      </v-btn>
      <v-btn color="success" @click="create" :disabled="!valid">
        Create
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'VolumesForm',
  props: {
    capacity_limit: {
      type: Number,
      default: 0
    },
    capacity_using: {
      type: Number,
      default: 0
    },
    volumesNames: {
      type: Array
    }
  },
  data: () => ({
    title: 'New Volume',
    valid: false,
    name: '',
    capacity: undefined
  }),
  methods: {
    cancle () {
      this.$refs.form.reset()
      this.$refs.form.resetValidation()
      this.$emit('cancle')
    },
    create () {
      this.$emit('create', {
        name: this.getPrefix + this.name,
        capacity: this.capacity
      })
      this.$refs.form.reset()
      this.$refs.form.resetValidation()
    }
  },
  computed: {
    getPrefix () {
      let prefix = this.$store.state.user.email.split('@')[0]
      prefix = prefix.replace(/[^\w\s]/gi, '') + '-'
      return prefix
    },
    // rule
    name_rules () {
      return [
        v => !!v || 'Name is required',
        v => (v && v.length <= 30) || 'Name must be less then 30 characters',
        v => /^[a-z0-9]([-a-z0-9]*[a-z0-9])$/.test(this.getPrefix + v) || 'Name only can containing lowercase alphabet, number and -',
        v => !this.volumesNames.includes(this.getPrefix + v) || 'Name already exist'
      ]
    },
    cap_rules () {
      return [
        v => !!v || 'Capacity is required',
        v => v <= this.capacity_limit - this.capacity_using ||
          `Capacits must be less then ${this.capacity_limit - this.capacity_using} limit`
      ]
    }
  }
}
</script>
