var router = require('express').Router()
let jobController = require('../../controllers/jobController')

router.get('/', jobController.jobs_list)
router.post('/', jobController.create_job)
router.delete('/:id', jobController.delete_job)

// Get Job Logs
router.get('/:id/log', async (req, res) => {
  // get pod for job
  var { data } = await kubeAPI.get('/namespaces/ml-instance/pods?labelSelector=job-name=' + req.params.id)
  const podname = data.items[0].metadata.name

  // get jobs data
  var { data } = await kubeAPI.get('/namespaces/ml-instance/pods/' + podname + '/log')

  // final response
  const response = {
    logs: data
  }
  res.send(response)
})

module.exports = router
