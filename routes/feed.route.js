const express = require('express')

const router = express.Router()
const feedController = require('../controllers/feed.controller')
const validator = require('../utils/validator')
const auth = require('../middlewares/is-auth')

router.get('/posts', auth.isAuth, feedController.getPosts)

router.post('/create-post', validator.postValidator, auth.isAuth, feedController.createPost)

router.get('/post/:postId',auth.isAuth, feedController.getPost)

router.put('/edit-post/:postId', validator.postValidator, auth.isAuth, feedController.UpdatePost)

router.delete('/delete-post/:postId', auth.isAuth, feedController.deletePost)

router.post('/add-comment', auth.isAuth, feedController.addComment)

router.get('/get-comments/:parentId', auth.isAuth, feedController.getComments)

router.post('/update-like', auth.isAuth, feedController.updateLikeOnPost)

module.exports = router