const moment = require('moment');

function composeFxRatesMsg(rates) {
    const output = [];

    for (const rate of rates) {
        output.push([
            `${rate.currencyFrom.currencyCode}/`,
            `${rate.currencyTo.currencyCode}: `,
            `${rate.rate.toFixed(4)} `,
            `(${moment(rate.updatedAt).format('DD.MM.YYYY HH:mm')}, `,
            `${rate.source})`,
        ].join(''));
    }

    return output;
}

module.exports = composeFxRatesMsg;