const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    poolId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Pool',
    },
    amount: {
        type: Number,
    },
    currency: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Currency',
    },
    description: {
        type: String,
    },
    status: {
        type: String,
    },
}, {
    timestamps: true
});

expenseSchema.virtual('poolCurrencies', {
    ref: 'PoolCurrency',
    localField: 'poolId',
    foreignField: 'pool',
    justOne: false,
    options: {
        match: expense => ({
            'currency': expense.currency,
        }),
    },
});

expenseSchema.set('toObject', { virtuals: true });
expenseSchema.set('toJSON', { virtuals: true });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;