const Post = require('../models/post.model')
const Comment = require('../models/comment.model')
const User = require('../models/user.model')

exports.setGotResponse = async ( isFromPost, parentId ) => {
    let entry = undefined
    try {
        if(isFromPost){
            entry = await Post.findById(parentId)
        }else{
            entry = await Comment.findById(parentId)
        }
        entry.gotResponse += 1
        await entry.save()
        
    } catch (error) {
        console.log('error dans setgotresponse : ', error)
    }
}

exports.deleteChildren = async (childrenArray) => {
    try {
        childrenArray.forEach(async child => {
            if(child.gotResponse > 0){
                const childToDelete = await Comment.find({parentId: child._id})
                this.deleteChildren(childToDelete)
            }
            await Comment.findByIdAndRemove(child._id)
        })
    } catch (error) {
        console.log(error)
    }
}

exports.addResponseCountOnPost = async (postId) => {
    try {
        const post = await Post.findById(postId)
        post.gotResponse += 1
        await post.save()
    } catch (error) {
        console.log(error)
    }
}

exports.isAlreadyFriends = (sender, receiver) => {
    const onSenderList = sender.friendsList.find(receiver._id)
    const onReceiverList = receiver.friendsList.find(sender._id)
    if(onSenderList || onReceiverList){
        console.log('ils sont deja amis')
        return true
    }
    return false
}