const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    teleUserId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    nick: {
        type: String
    },
    chatId: {
        type: Number,
        required: true
    },
    currentPoolId: {
        type: mongoose.Schema.Types.ObjectId
    },
    isActive: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;