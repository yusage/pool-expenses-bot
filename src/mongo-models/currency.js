const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
    currencyCode: {
        type: String,
        required: true,
        unique: true,
    },
    symbol: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    mask: {
        type: String,
        required: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Currency = mongoose.model('Currency', currencySchema);

module.exports = Currency;