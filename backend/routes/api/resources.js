let router = require('express').Router()
let resourceController = require("../../controllers/resourceController")

router.get('/', resourceController.get_resources)

module.exports = router
