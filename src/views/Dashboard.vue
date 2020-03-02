<template>
  <v-container fluid grid-list-md>
    <!-- Top Indicator Cards -->
    <v-row>
      <v-col md="2">
        <v-card>
          <v-toolbar color="green" flat dark>
            <v-toolbar-title>
              Instances
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ run_instances }} / {{ total_instances }}
          </v-card-title>
        </v-card>
      </v-col>
      <v-col md="2">
        <v-card>
          <v-toolbar color="green" flat dark>
            <v-toolbar-title>
              Volumes
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ total_volumes }}
          </v-card-title>
        </v-card>
      </v-col>
      <v-spacer></v-spacer>
      <v-col md="2">
        <v-card>
          <v-toolbar color="orange" flat dark>
            <v-toolbar-title>
              CPUs
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ cpu_using }} / {{ cpu_limit }}
          </v-card-title>
        </v-card>
      </v-col>
      <v-col md="2">
        <v-card>
          <v-toolbar color="orange" flat dark>
            <v-toolbar-title>
              Memory
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ memory_using }} / {{ memory_limit }} Gi
          </v-card-title>
        </v-card>
      </v-col>
      <v-col md="2">
        <v-card>
          <v-toolbar color="orange" flat dark>
            <v-toolbar-title>
              GPUs
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title primary-title>
            {{ gpu_using }} / {{ gpu_limit }}
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <!-- END Top Indicator Cards -->

    <v-row>
      <!-- Instances Table -->
      <v-col md="6">
        <v-card>
          <v-toolbar color="blue" flat dark>
            <v-toolbar-title>
              Instances
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="dialog_new_instance = true">
              <v-icon color="white">mdi-plus-box</v-icon>
            </v-btn>
            <v-dialog v-model="dialog_new_instance" max-width="500" persistent>
              <v-card>
                <v-card-title>
                  {{ this.instance_is_edit ? 'Edit' : 'New' }} Instance
                </v-card-title>
                <v-card-text>
                  <v-form
                    ma-4
                    ref="form"
                    v-model="new_instance"
                  >
                    <v-text-field
                      v-model="instance_name"
                      :counter="20"
                      :rules="name_rules"
                      label="Name"
                      required
                      :disabled="instance_is_edit ? true : false"
                    ></v-text-field>
                    <v-text-field
                      v-model="instance_cpus"
                      :suffix="' / ' + (this.cpu_limit - this.cpu_using)"
                      :rules="cpu_rules"
                      label="CPUs"
                      required
                    ></v-text-field>
                    <v-text-field
                      v-model="instance_memory"
                      :suffix="' / ' + (this.memory_limit - this.memory_using)"
                      :rules="memory_rules"
                      label="Memory"
                      required
                    ></v-text-field>
                    <v-text-field
                      v-model="instance_gpus"
                      :suffix="' / ' + (this.gpu_limit - this.gpu_using)"
                      :rules="gpu_rules"
                      label="GPUs"
                      required
                      :disabled="instance_is_edit ? true : false"
                    ></v-text-field>
                    <v-select
                      v-model="instance_volume"
                      :items="volumes"
                      item-text="name"
                      item-value="id"
                      label="Volume"
                      required
                      :disabled="instance_is_edit ? true : false"
                    ></v-select>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="gray"
                    @click="cancle"
                  >
                    Cancle
                  </v-btn>
                  <v-btn
                    v-if="instance_is_edit === false"
                    color="success"
                    @click="add_instance"
                  >
                    Create
                  </v-btn>
                  <v-btn
                    v-if="instance_is_edit === true"
                    color="success"
                    @click="edit_instance"
                  >
                    Update
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>

          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Name</th>
                  <th>SSH Port</th>
                  <th>GPUs</th>
                  <th>Volume</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in instances" :key="item.name">
                  <td>
                    <v-icon
                      v-if="item.status === 'running'"
                      class="running"
                      >
                      mdi-check-circle
                    </v-icon>
                    <v-icon
                      v-else-if="item.status === 'waitting'"
                      class="waitting"
                      >
                      mdi-loading
                    </v-icon>
                    <v-icon
                      v-else
                      class="failed"
                      >
                      mdi-alert-circle
                    </v-icon>
                  </td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.port }}</td>
                  <td>{{ item.gpus }}</td>
                  <td>{{ item.volume }}</td>
                  <td>
                    <v-btn icon @click="edit_instance(item.name)">
                      <v-icon>mdi-square-edit-outline</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card>
      </v-col>
      <!-- END Instances Table -->

      <!-- Volumes Table -->
      <v-col md="6">
        <v-card>
          <v-toolbar color="blue" flat dark>
              <v-toolbar-title>
              Volumes
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="dialog_new_volume = true">
              <v-icon color="white">mdi-plus-box</v-icon>
            </v-btn>
            <v-dialog v-model="dialog_new_volume" persistent>
              <v-card>
                <v-card-title>
                  New Volume
                </v-card-title>
                <v-card-text>
                  NEW VOLUME FORM
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="gray"
                    @click="dialog_new_volume = false"
                  >
                    Cancle
                  </v-btn>
                  <v-btn
                    color="success"
                    @click="dialog_new_volume = false"
                  >
                    Create
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in volumes" :key="item.name">
                  <td>{{ item.name }}</td>
                  <td>{{ item.size }}</td>
                  <td>{{ item.status }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card>
      <!-- END Volumnes Table -->

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    // top status
    gpu_limit: 0,
    cpu_limit: 0,
    memory_limit: 0,

    // instances
    instances: [],
    volumes: [],

    // dialog switch
    dialog_new_instance: false,
    dialog_new_volume: false,

    // form
    new_instance: false,
    instance_is_edit: false,
    instance_name: '',
    instance_cpus: '',
    instance_memory: '',
    instance_gpus: '',
    instance_volume: '',

    new_volume: false
  }),
  mounted () {
    this.get()
  },
  methods: {
    // computed methods
    to_value_list (key) {
      return this.instances.map((item) => {
        return item[key]
      })
    },
    sum (list) {
      return list.reduce((a, b) => {
        return a + b
      }, 0)
    },

    get () {
      this.gpu_limit = 4
      this.cpu_limit = 20
      this.memory_limit = 32
      this.instances = [
        {
          name: 'gpu1',
          status: 'running',
          port: 33021,
          cpus: 5,
          memory: 5,
          gpus: 1,
          volume: 'vol1'
        },
        {
          name: 'gpu2',
          status: 'waitting',
          port: 31221,
          cpus: 5,
          memory: 5,
          gpus: 1,
          volume: 'vol2'
        },
        {
          name: 'gpu3',
          status: 'failed',
          port: 30221,
          cpus: 5,
          memory: 5,
          gpus: 1,
          volume: 'vol2'
        }
      ]
      this.volumes = [
        {
          name: 'vol1',
          size: '100Gi',
          status: 'bound'
        },
        {
          name: 'vol2',
          size: '100Gi',
          status: 'bound'
        }
      ]
    },
    post () {

    },
    put () {

    },
    del () {

    },

    // form
    cancle () {
      this.instance_is_edit = false
      this.instance_name = null
      this.instance_cpus = null
      this.instance_memory = null
      this.instance_gpus = null
      this.instance_volume = null
      this.dialog_new_instance = false
    },
    add_instance () {
      this.instance_is_edit = false
      this.instance_name = null
      this.instance_cpus = null
      this.instance_memory = null
      this.instance_gpus = null
      this.instance_volume = null
      this.dialog_new_instance = true
    },
    edit_instance (id) {
      const item = this.instances.find(v => {
        return v.name === id
      })
      this.instance_is_edit = true
      this.instance_name = item.name
      this.instance_cpus = item.cpus
      this.instance_memory = item.memory
      this.instance_gpus = item.gpus
      this.instance_volume = item.volume
      this.dialog_new_instance = true
    }
  },
  computed: {
    // top
    total_instances () {
      return this.instances.length
    },
    run_instances () {
      return this.instances.filter((item) => {
        return item.status === 'running'
      }).length
    },
    total_volumes () {
      return this.volumes.length
    },
    cpu_using () {
      return this.sum(this.to_value_list('cpus'))
    },
    memory_using () {
      return this.sum(this.to_value_list('memory'))
    },
    gpu_using () {
      return this.sum(this.to_value_list('gpus'))
    },

    // rule
    name_rules () {
      return [
        v => !!v || 'Name is required',
        v => v.length <= 20 || 'Name must be less then 20 characters'
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

<style scoped>

.running {
  color: green;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.waitting {
  animation-name: spin;
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.failed {
  color: red;
}
</style>
