const moment = require('moment');

function composePoolCurrenciesMsg(poolCurrencies) {
    const output = [];

    for (const c of poolCurrencies) {
        output.push(
            `<b>${c.currencyCode}:</b> rate=${c.rate.toFixed(4)} (source: ${c.source}, ` +
            `fx date: ${moment(c.setDate).format('DD.MM.YYYY')})`
        );
    }

    return output;
}

module.exports = composePoolCurrenciesMsg;