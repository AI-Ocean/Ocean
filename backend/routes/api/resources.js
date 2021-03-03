let router = require('express').Router()
let resourceController = require("../../controllers/resourceController")

router.get('/', resourceController.get_resources)

router.get('/request', resourceController.get_resource_request_quota)
router.post('/request/', resourceController.create_resource_request_quota)
router.patch('/request/:uid', resourceController.modify_resource_request_quota)
router.delete('/request/:uid', resourceController.delete_resource_request_quota)

module.exports = router
