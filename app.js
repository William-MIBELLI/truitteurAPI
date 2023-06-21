const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')
require('dotenv').config()

const app = express()
const feedRouter = require('./routes/feed.route')
const authRouter = require('./routes/auth.route')
const socialRouter = require('./routes/social.route')

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('file dans filestorage : ', file)
        const fieldName = file.fieldname
        cb(null, `upload/${fieldName}`)
    },
    filename : (req, file, cb) => {
        cb(null, `${Date.now().toString()}-${file.originalname}`)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
        return cb(null, true)
    }
    return cb(null, false)
}

app.use(cors())
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*')
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, UPDATE, PATCH, DELETE')
//     res.setHeader('Access-Control-Allow-Headers', '*')
// })
app.use(bodyParser.json())
app.use(multer({ storage: fileStorage, fileFilter}).fields([
    {name: 'postimage', maxCount: 1},
    {name: 'userpicture', maxCount: 1}
]))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use(feedRouter)
app.use(authRouter)
app.use(socialRouter)
app.use((error, req, res, next) => {
    console.log('middleware error : ', error)
    res.status(500).json({status: 500, message: error.message})
})
mongoose.connect(process.env.MONGODB_CONNECT_KEY).then(app.listen(8080))
