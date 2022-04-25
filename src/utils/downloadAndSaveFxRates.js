const downloadFxRates = require('./downloadFxRates');

async function downloadAndSaveFxRates(currencies, db) {
    const currenciesToCodes = currencies.map((c) => c.currencyCode).join(',');
    const output = [];

    for (const currencyFrom of currencies) {
        //      get cross fx Rates for all other currencies
        const rates = await downloadFxRates(
            currencyFrom.currencyCode,
            currenciesToCodes
        );
        if (!rates) return;

        //      save records to database
        for (const currencyTo of currencies) {
            const s = await db.updateFxRate({
                currencyFromId: currencyFrom._id,
                currencyToId: currencyTo._id,
                rate: rates[currencyTo.currencyCode],
                source: 'exchangerate.host'
            });
            output.push(s);
        }
    }

    return output;
}

module.exports = downloadAndSaveFxRates;