const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    passwordHash: String,
    photoUrl: String,
    description: String,
    gender: {
        type: String,
        enum: ['male', 'female'],
        default: null,
    },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
