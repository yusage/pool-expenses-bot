const mongoose = require('mongoose');

const poolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    users: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

poolSchema.virtual('expenses', {
    ref: 'Expense',
    localField: '_id',
    foreignField: 'poolId'
});

poolSchema.virtual('poolUsers', {
    ref: 'User',
    localField: 'users.userId',
    foreignField: '_id'
});

const Pool = mongoose.model('Pool', poolSchema);

module.exports = Pool;