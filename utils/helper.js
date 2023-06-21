const fs = require('fs')
const path = require('path')

exports.deleteImage = filePath => {
    const p = path.join(__dirname,'..',  filePath)
    fs.unlink(p, (err) => console.log(err))
}