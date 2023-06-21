const jwt = require('jsonwebtoken')

exports.isAuth = async (req, res, next) => {

    if(!req.get('Authorization')){
        return next(new Error('can\'t grab token'))
    }

    const token = req.get('Authorization').split(' ')[1]
    try {
        const decodedT = jwt.verify(token, 'secretString')
        //console.log(decodedT)
        if(!decodedT){
            throw new error('token not available')
        }
        req.userId = decodedT._id
        //console.log('req.userId : ', req.userId)
        next()
    } catch (error) {   
        next(error)
    }
}