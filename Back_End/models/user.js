const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    roles: [{ type: 'String' }], // this isn't used atm
    isVerified: { type: Boolean, default: false },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    followersNum: {type: Number, required: true, default: 0},
    followingNum: {type: Number, required: true, default: 0},
    followers: [],
    following: []
})

module.exports = mongoose.model('User', userSchema);