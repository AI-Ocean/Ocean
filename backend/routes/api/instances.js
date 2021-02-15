var router = require('express').Router()

const instnaceController = require('../../controllers/instanceController')

router.get('/', instnaceController.get_instances_list)
router.post('/', instnaceController.create_instance)
router.delete('/:id', instnaceController.delete_instance)

module.exports = router
