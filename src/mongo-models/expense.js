const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    poolId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Pool'
    },
    amount: {
        type: Number
    },
    currency: {
        type: String
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

expenseSchema.virtual('users', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id'
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;