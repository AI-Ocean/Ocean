var router = require('express').Router()
let jobController = require('../../controllers/jobController')

router.get('/', jobController.get_jobs_list)
router.post('/', jobController.create_job)
router.delete('/:id', jobController.delete_job)
router.get('/:id/log', jobController.get_job_log)

module.exports = router
