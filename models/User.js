const mongoose = require('mongoose')

// Creation of Schema (MongoDB Collection)
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
    },
    email: {
        type: String, 
        unique: true
    },
    password: String,
})

// Creation of Model so we can communicate with backend express code
const UserModel = mongoose.model('User', UserSchema)


module.exports = UserModel