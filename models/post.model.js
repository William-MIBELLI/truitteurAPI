const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String
    },
    like: {
        type: Number,
        default: 0
    },
    gotResponse: {
        type: Number,
        required: true,
        default: 0
    }
},{ timestamps: true})

module.exports = mongoose.model('Post', postSchema)