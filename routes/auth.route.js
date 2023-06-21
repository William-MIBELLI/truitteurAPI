const express = require('express')
const validator = require('../utils/validator')
const authController = require('../controllers/auth.controller')

const router = express.Router()

router.put('/create-user', validator.signInValidator, authController.signIn )

router.post('/login', validator.logInValidator , authController.logIn)

router.get('/forget-password/:email', authController.forgetPassword)

router.patch('/reset-password', validator.resetPasswordValidator, authController.resetPassword)

module.exports = router