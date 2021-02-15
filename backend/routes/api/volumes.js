let router = require('express').Router()
let volumeController = require('../../controllers/volumeController')

router.get('/', volumeController.get_volumes_list)
router.post('/', volumeController.create_volume)
router.delete('/:id', volumeController.delete_volume)

module.exports = router
