const mongoose = require('mongoose');

const poolCurrencySchema = new mongoose.Schema({
    pool: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Pool',
    },
    currency: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Currency',
    },
    rate: {
        type: Number,
        required: true,
    },
    source: {
        type: String,
    },
    currencyCode: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    mask: {
        type: String,
        required: true,
    },
    setDate: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

const PoolCurrency = mongoose.model('PoolCurrency', poolCurrencySchema);

module.exports = PoolCurrency;