const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
    currencyFrom: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Currency',
    },
    currencyTo: {
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
}, {
    timestamps: true,
});

const Rate = mongoose.model('Rate', rateSchema);

module.exports = Rate;