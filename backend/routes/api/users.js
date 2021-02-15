const router = require('express').Router()
const userController = require("../../controllers/userController")

router.get('/', userController.users_list)

router.get('/:uid', userController.user_detail)
router.patch('/:uid', userController.user_modify)
router.delete('/:uid', userController.user_delete)

module.exports = router