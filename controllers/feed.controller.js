const Post = require('../models/post.model')
const User = require('../models/user.model')
const Comment = require('../models/comment.model')

const { deleteImage } = require('../utils/helper')
const { validationResult } = require('express-validator')
const { setGotResponse, deleteChildren, addResponseCountOnPost } = require('../utils/mongoose-helper')

exports.getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().populate('author', 'name')
        if(!posts){
            throw new Error('no posts')
        }
        //console.log('posts : ', posts)
        res.status(200).json({ posts, status: 200 })
    } catch (error) {
        next(error)
    }
}

exports.createPost = async (req, res, next) => {

    const { title, message, author } = req.body
    const errors = validationResult(req)
    const file = req.files.postimage[0]
    
    
    try{
        if(!file){
            throw new Error('L\'image doit être au format png / jpg')
        }
        if(!errors.isEmpty){
            //console.log(errors.array())
            throw new Error('erreur de validation')
        }
        const post = new Post({
            title,
            message,
            author,
            imageUrl: file.path
        })
        await post.save()
        const user = await User.findById(author)
        await user.save()
        res.status(201).json({
            message: 'Post created succesfully !' ,
            post,
            status: 201
        })
    } catch (error){
        next(error)
    }
}

exports.getPost = async (req, res, next) => {
    try {
        const { postId } = req.params
        const post = await Post.findById(postId).populate('author', 'name').populate({path: 'comments', populate : { path: 'userId', select: 'name'}})
        if(!post){
            throw new Error('No post with this id 😢')
        }
        const comm = await post.populate('comments')
        //console.log('comm : ', comm)
        res.status(200).json({ post })
    } catch (error) {
        next(error)
    }
}

exports.UpdatePost = async (req, res, next) => {

    const { title, message, _id } = req.body
    let image = null
    if(req.files.postimage[0]){
        image = req.files.postimage[0]
    }

    try {
        const post = await Post.findById(_id)
        if(!post){
            throw new Error('No post with this id')
        }
        if(post.author.toString() !== req.userId.toString()){
            throw new Error('Unauthorized user')
        }
        post.title = title
        post.message = message
        if(image){
            deleteImage(post.imageUrl)
            post.imageUrl = image.path
        }
        await post.save()
        res.status(200).json({msg: 'update OK', status: 200, post})
    } catch (error) {
        next(error)
    }
}

exports.deletePost = async (req, res, next) => {
    const { postId } = req.params

    try {
        const post = await Post.findById(postId)
        if(!post){
            throw new Error('No post with this id')
        }
        if(post.author.toString() !== req.userId.toString()){
            throw new Error('Unauthorized user')
        }
        deleteImage(post.imageUrl)
        const commentsToDelete = await Comment.find({ parentId : postId })
        deleteChildren(commentsToDelete)
        await Post.findByIdAndRemove(postId)
        const user = await User.findById(req.userId)
        user.posts.pull(postId)
        await user.save()
        res.status(200).json({message: 'post deleted successfully', status: 200})
    } catch (error) {
        next(error)
    }
}

exports.addComment = async (req, res, next) => {

    const { parentId, message, fromPost, postRef } = req.body
    const isFromPost = fromPost.toLowerCase() === 'true'

    try {
        const comment = new Comment({
            message,
            userId: req.userId,
            parentId,
            parentType: isFromPost ? 'Post' : 'Comment',
            postRef
        })
        addResponseCountOnPost(postRef)
        await setGotResponse(isFromPost, parentId)
        await comment.save()
        res.status(201).json({status: 201, comment})
    } catch (error) {
        next(error)
    }
}

exports.getComments = async (req, res, next) => {
    const { parentId } = req.params
    try {
        const comments = await Comment.find({ parentId }).populate('userId', 'name')
        //console.log('comments : ', comments)
        comments.forEach(c => console.log(c.gotResponse))
        res.status(200).json({status: 200, comments})
    } catch (error) {
        next(error)
    }
}

exports.updateLikeOnPost = async (req, res, next) => {
    const { postId, likeValue, parentType } = req.body
    const userId = req.userId
    console.log('parentType  :' , parentType)
    try {
        const parent = parentType === 'Post' ?  await Post.findById(postId) : await Comment.findById(postId)
        const user = await User.findById(userId)

        const findPost = user.likedPost.length !== 0 ? user.likedPost.find(p => p.postId.toString() === postId.toString()) : undefined

        if(findPost){
            parent.like -= +findPost.value
            await user.likedPost.pull(findPost)
        }
        parent.like += +likeValue
        user.likedPost.push({postId, value: likeValue})
        await parent.save()
        await user.save()
        res.status(201).json({status: 201, parent, user })
    } catch (error) {
        next(error)
    }
}
