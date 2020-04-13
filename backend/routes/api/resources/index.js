var router = require('express').Router()
var { kubeAPI, getSelector, getUserID } = require('../../../utils')

// Get Instances
router.get('/', async (req, res) => {
  // get pods data
  const { data } = await kubeAPI.get('/nodes')

  // sum resources
  const total = {
    cpus: 0,
    mem: 0,
    gpus: 0,
    capacity: 6000
  }

  data.items.forEach(v => {
    if (v.metadata.name === 'master'){
      return
    }
    const { cpu, memory } = v.status.capacity
    const gpu = v.status.capacity['nvidia.com/gpu']

    total.cpus += Number(cpu)
    total.mem += Math.round(Number(memory.slice(0, -2)) / 1024 / 1024)
    total.gpus += Number(gpu)
  })

  res.send(total)
})

module.exports = router
