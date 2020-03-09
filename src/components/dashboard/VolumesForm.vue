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
          counter="20"
          :rules="this.name_rules"
          label="Name"
          required
        >
        </v-text-field>
        <v-text-field
          v-model.number="capacity"
          :rules="this.cap_rules"
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
      <v-btn color="success" @click="create">
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
        name: this.name,
        capacity: this.capacity
      })
      this.$refs.form.reset()
      this.$refs.form.resetValidation()
    }
  },
  computed: {
    // rule
    name_rules () {
      return [
        v => !!v || 'Name is required',
        v => v.length <= 20 || 'Name must be less then 20 characters',
        v => /^[a-z]+/.test(v) || 'Name must start with lowercase alphabet',
        v => /^[a-z0-1-]*$/.test(v) || 'Name only can containing lowercase alphabet, number and -'
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
