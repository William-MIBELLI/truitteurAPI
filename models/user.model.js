const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: {
        type: String
    },
    pictureUrl: {
        type: String,
        required: true
    },
    resetTokenExpiration: {
        type: Date
    },
    likedPost: [
        {
            postId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Post'
            },
            value:{
                type: Number,
                default: 0
            }
        }
    ],
    friendsList: [
        {
            friendId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        }
    ],
    friendsRequest:[
        {
            userId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    sentRequest:[
        {
            userId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ]
    // ,
    // posts: [
    //     { postId: {type: mongoose.Types.ObjectId, ref: 'Post'} }
    // ]
})



module.exports = mongoose.model('User', userSchema)