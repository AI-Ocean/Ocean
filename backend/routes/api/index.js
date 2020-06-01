var router = require('express').Router()

router.use('/notice', require('./notice'))
router.use('/schedules', require('./schedules'))
router.use('/resources', require('./resources'))
router.use('/instances', require('./instances'))
router.use('/volumes', require('./volumes'))
router.use('/users', require('./users'))

module.exports = router
