const User = require('../models/user.model')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail')
const crypto = require('crypto')


exports.signIn = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        const file = req.files.userpicture[0]
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            //console.log(errors.array())
            throw new Error('Erreur de validation')
        }
        const hashedPass = await bcrypt.hash(password, 12)
        const user = new User({
            name,
            email,
            password: hashedPass,
            pictureUrl: file.path
        })
        await user.save()
        res.status(201).json({status: 201, message: 'user created successfully'})
    } catch (error) {
        next(error)
    }
}

exports.logIn = async (req, res, next) => {

    const { email, password } = req.body
    
    try {
        const user = await User.findOne({ email }).populate({path: 'friendsRequest', populate : { path: 'userId', select: 'name pictureUrl'}})
        //console.log('user : ', user)
        if(!user){
            throw new Error('wrong email / password')
        }
        const comp =  await bcrypt.compare(password, user.password)
        if(!comp){
            throw new Error('wrong email / password')
        }
        const { _id, name } = user
        const token = jwt.sign({
            email,
            name,
            _id
        }, 'secretString', { expiresIn: '24h'})
        console.log(user)
        res.status(200).json({ user : {...user._doc, password: null}, token, status: 200})
    } catch (error) {
        next(error)
    }
}

exports.forgetPassword = async (req, res, next) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const { email } = req.params
    const msg = {
        to: '',
        from: 'william.mibelli@gmail.com',
        subject: 'Reset password',
        text: ''
    }
    try {
        const user = await User.findOne({ email: email.toLowerCase() })
        if(!user){
            throw new Error('No user with this email')
        }
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiration = Date.now() + 3600000
        user.resetToken = resetToken
        user.resetTokenExpiration = resetTokenExpiration
        msg.text = `http://localhost:3000/reset-password/${resetToken}`
        msg.to = email.toLowerCase()
        await user.save()
        await sgMail.send(msg)
        res.status(200).json({link: `http://localhost:3000/reset-password/${resetToken}`, status: 200})
    } catch (error) {
        next(error)
    }
}

exports.resetPassword = async (req, res, next) => {
    const { email, password, token } = req.body

    try {
        const user = await User.findOne({ email, resetToken: token })
        if(!user){
            throw new Error('No user with this email')
        }
        if(user.resetTokenExpiration < Date.now()){
            throw new Error('Token expired')
        }
        const hashedPass = await bcrypt.hash(password, 12)
        user.password = hashedPass,
        user.resetToken = undefined
        user.resetTokenExpiration = undefined
        await user.save()
        res.status(201).json({message: 'password updated succesfully', status: 201})
    } catch (error) {
        next(error)
    }
}