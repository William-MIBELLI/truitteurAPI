const User = require('../models/user.model')
const { isAlreadyFriends, SenderGotFriendsRequest } = require('../utils/mongoose-helper')

exports.sendFriendRequest = async (req, res, next) => {
    //const { idToRequest } = req.params
    const{ idToRequest } = req.body
    console.log(idToRequest)
    try {
        const userToRequest = await User.findById(idToRequest)
        const userWhoSend = await User.findById(req.userId)
        const isFriend = isAlreadyFriends(userWhoSend, userToRequest)               ////////// ON VERIFIE SILS NE SONT PAS DEJA AMIS
        if(!isFriend){
            const isRequest = SenderGotFriendsRequest(userToRequest, req.userId)
            if(isRequest){                                                      ////// ON REGARDE ENSUITE SI ON A UNE DEMANDE DAMI EN ATTENTE DE LUSER QUON REQUEST
                userToRequest.friendsList.push({friendId: req.userId})          ////// SI OUI ON ENVOIE PAS LA DEMANDE MAIS ON LES MET AMIS DIRECT
                userWhoSend.friendsList.push({friendId: userToRequest._id})
                userToRequest.sentRequest.pull({userId: req.userId})
                userWhoSend.friendsRequest.pull({userId: userToRequest._id})
            }else{                                                              ///// SINON ON ENVOIE LA DEMANDE
                userToRequest.friendsRequest.push({ userId: req.userId})
                userWhoSend.sentRequest.push({ userId: idToRequest})
            }
        }
        await userWhoSend.save()
        await userToRequest.save()
        const userForResp = await User.findById(req.userId)
        res.status(201).json({ status: 201, user: {...userForResp._doc, password: null}})
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
        sender.sentRequest.pull({userId: req.userId})   /////// ON REMOVE LA REQUEST DANS LES 2 USERS
        user.friendsRequest.remove({userId: sender._id}) 
        const isFriend = isAlreadyFriends(sender, user)
        if(booleanAnswer && !isFriend){             ///////// SI LA REPONSE EST TRUE ET QUILS NE SONT PAS DEJA AMIS, ON LES AJOUTE
            sender.friendsList.push({friendId: req.userId})
            user.friendsList.push({friendId: sender._id})
            console.log('friend added !')
        }
        await sender.save()
        await user.save()
        const userToSend = await User.findById(req.userId).populate({path: 'friendsRequest', populate : { path: 'userId', select: 'name'}})
        res.status(201).json({ user: {...userToSend._doc, password: null}})
    } catch (error) {
        next(error)
    }
}
