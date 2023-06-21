const { body, check } = require('express-validator')
const User = require('../models/user.model')

exports.signInValidator = [
    body('name').isString().trim().isLength({min: 3}),
    body('email').isEmail().custom( async value  => {
        const user = await User.findOne({ email: value})
        if(user){
            throw new Error('Cette adresse email est déjâ utilisée')
        }
    }),
    body('password').trim().isLength({min: 6}),
    body('confirmPassword', 'Les mots de passe doivent correspondre').trim().custom((value, { req }) => {
        return value === req.body.password
    })
]

exports.logInValidator = [
    body('email').isEmail(),
    body('password').trim().isString().notEmpty()
]

exports.postValidator = [
    body('author').trim().notEmpty(),
    body('title').trim().isLength({ min: 5 }),
    body('message').trim().isString().isLength({min: 5, max: 400})
]

exports.resetPasswordValidator = [
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6}),
    body('confirmPassword', 'Les mots de passe doivent correspondre').trim().custom((value, { req }) => {
        return value === req.body.password
    }),
    body('token').isString().notEmpty()
]

