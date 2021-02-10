const router = require('express').Router()

const authController = require('../controllers/authController');

// SignUp
router.post('/signup', authController.signup);

//SignIn
router.post('/signin', authController.signin);

module.exports = router;