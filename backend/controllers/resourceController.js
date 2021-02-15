var { kubeAPI } = require('../utils')

module.exports.get_resources = async (req, res) => {
  let data
  try{
    // get pods data
    const pod = await kubeAPI.get('/nodes?labelSelector=accelerator')
    data = pod.data
  } catch (err) {
    return res.status(503).json(err.response.data)
  }

  // sum resources
  const total = {
    cpus: 0,
    mem: 0,
    gpus: 0,
    capacity: 6000
  }

  data.items.forEach(v => {
    const { cpu, memory } = v.status.capacity
    const gpu = v.status.capacity['nvidia.com/gpu']

    total.cpus += Number(cpu)
    total.mem += Math.round(Number(memory.slice(0, -2)) / 1024 / 1024)
    total.gpus += Number(gpu)
  })

  return res.json(total)
}