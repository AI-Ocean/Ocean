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
          :rules="this.name_rules"
          label="Name"
          :prefix="getPrefix"
          required
        >
        </v-text-field>
        <v-text-field
          v-model.number="cpus"
          type="number"
          :rules="this.cpu_rules"
          label="CPUs"
          required
          :suffix="' / ' + (this.cpu_limit - this.cpu_using)"
        >
        </v-text-field>
        <v-text-field
          v-model.number="memory"
          type="number"
          :rules="this.memory_rules"
          label="Memory"
          required
          :suffix="' / ' + (this.memory_limit - this.memory_using)"
        >
        </v-text-field>
        <v-text-field
          v-model.number="gpus"
          :rules="this.gpu_rules"
          type="number"
          label="GPUs"
          required
          :suffix="' / ' + (this.gpu_limit - this.gpu_using)"
        >
        </v-text-field>
        <v-select
          v-model="volume"
          :items="this.volumes"
          label="Volumes"
          required
          chips
        >
        </v-select>
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
  name: 'InstancesForm',
  props: {
    cpu_limit: {
      type: Number,
      default: 0
    },
    cpu_using: {
      type: Number,
      default: 0
    },
    memory_limit: {
      type: Number,
      default: 0
    },
    memory_using: {
      type: Number,
      default: 0
    },
    gpu_limit: {
      type: Number,
      default: 0
    },
    gpu_using: {
      type: Number,
      default: 0
    },
    volumes: {
      type: Array
    },
    instancesNames: {
      type: Array
    }
  },
  data: () => ({
    title: 'New Instance',
    valid: false,
    name: '',
    cpus: undefined,
    memory: undefined,
    gpus: undefined,
    volume: undefined
  }),
  methods: {
    cancle () {
      this.$refs.form.resetValidation()
      this.$refs.form.reset()
      this.$emit('cancle')
    },
    create () {
      this.$emit('create', {
        name: this.getPrefix + this.name,
        cpus: this.cpus,
        memory: this.memory,
        gpus: this.gpus,
        volume: this.volume
      })
      this.$refs.form.resetValidation()
      this.$refs.form.reset()
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
        v => !this.instancesNames.includes(this.getPrefix + v) || 'Name already exist'
      ]
    },
    cpu_rules () {
      return [
        v => !!v || 'CPUs is required',
        v => v <= this.cpu_limit - this.cpu_using ||
          `CPUs must be less then ${this.cpu_limit - this.cpu_using} limit`
      ]
    },
    memory_rules () {
      return [
        v => !!v || 'Memory is required',
        v => v <= this.memory_limit - this.memory_using ||
          `Memory must be less then ${this.memory_limit - this.memory_using} limit`
      ]
    },
    gpu_rules () {
      return [
        v => !!v || 'GPUs is required',
        v => v <= this.gpu_limit - this.gpu_using ||
          `GPUs must be less then ${this.gpu_limit - this.gpu_using} limit`
      ]
    }
  }
}
</script>
