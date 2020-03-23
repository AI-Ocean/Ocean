var router = require('express').Router()

router.use('/instances', require('./instances'))
router.use('/volumes', require('./volumes'))
router.use('/users', require('./users'))

module.exports = router
