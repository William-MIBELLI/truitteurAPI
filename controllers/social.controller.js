const User = require('../models/user.model')
const { isAlreadyFriends } = require('../utils/mongoose-helper')

exports.sendFriendRequest = async (req, res, next) => {
    //const { idToRequest } = req.params
    const{ idToRequest } = req.body
    console.log(idToRequest)
    try {
        const userToRequest = await User.findById(idToRequest)
        const userWhoSend = await User.findById(req.userId)
        console.log(userWhoSend)
        userToRequest.friendsRequest.push({ userId: req.userId})
        userWhoSend.sentRequest.push({ userId: idToRequest})
        await userWhoSend.save()
        await userToRequest.save()
        res.status(201).json({ status: 201, user: {...userWhoSend._doc, password: null}})
    } catch (error) {
        next(error)
    }
}

exports.answerRequest = async (req, res, next) => {
    
    const { senderId, answer } = req.body
    const booleanAnswer = answer.toLowerCase() === 'true'
    try {
        const sender = await User.findById(senderId)
        const user = await User.findById(req.userId)
        sender.sentRequest.pull({userId: req.userId})
        await user.friendsRequest.remove({userId: sender._id})
        if(booleanAnswer){
            sender.friendsList.push({friendId: req.userId})
            user.friendsList.push({friendId: sender._id})
        }
        await sender.save()
        await user.save()
        const userToSend = await User.findById(req.userId).populate({path: 'friendsRequest', populate : { path: 'userId', select: 'name'}})
        res.status(201).json({ user: {...userToSend._doc, password: null}})
    } catch (error) {
        next(error)
    }
}
