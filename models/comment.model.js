const mongoose = require('mongoose')

    // postId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Post'
    // },

const commentSchema = mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    like: {
        type: Number,
        required: true,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fileUrl: {
        type: String
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'comment.parentType'
    },
    parentType: {
        type: String,
        required: true,
        enum: ['Post', 'Comment']
    },
    postRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    gotResponse: {
        type: Number,
        required: true,
        default: 0
    }
},{ timestamps: true})


module.exports = mongoose.model('Comment', commentSchema)