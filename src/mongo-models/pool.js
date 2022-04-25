const mongoose = require('mongoose');

const poolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    users: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            ref: 'User',
        },
    }],
    mainCurrency: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            ref: 'Currency',
        },
        code: {
            type: String,
            required: true,
        },
        symbol: {
            type: String,
            required: true,
        },
    },
}, {
    timestamps: true
});

poolSchema.virtual('expenses', {
    ref: 'Expense',
    localField: '_id',
    foreignField: 'poolId'
});

poolSchema.virtual('currencies', {
    ref: 'PoolCurrency',
    localField: '_id',
    foreignField: 'pool'
});

poolSchema.set('toObject', { virtuals: true });
poolSchema.set('toJSON', { virtuals: true });

const Pool = mongoose.model('Pool', poolSchema);

module.exports = Pool;