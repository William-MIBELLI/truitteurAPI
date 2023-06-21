const express = require('express')
const router = express.Router()

const socialController = require('../controllers/social.controller')
const auth = require('../middlewares/is-auth')

router.post('/send-friend-request/',auth.isAuth, socialController.sendFriendRequest)

router.post('/answer-request', auth.isAuth, socialController.answerRequest)

module.exports = router