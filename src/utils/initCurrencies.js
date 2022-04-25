const cron = require('node-cron');
const downloadAndSaveFxRates = require('./downloadAndSaveFxRates');
const downloadAndSaveCurrencies = require('./downloadAndSaveCurrencies');

function initCurrencies(db) {

    console.log('Updating currencies data...');
    downloadAndSaveCurrencies(db)
        .then(({ errors, updated, created }) => {
            console.log([
                `Success. Errors: ${errors.length}, `,
                `Currencies updated: ${updated.length}, `,
                `Currencies created: ${created.length}`,
            ].join(''));
            const defaultCurrenciesCode = process.env.DEFAULT_CURRENCIES.split(',');
            console.log('Setting default currencies: ', defaultCurrenciesCode);
            return db.setDefaultCurrencies(defaultCurrenciesCode);
        }).then((defaultCurrencies) => {
            console.log('Default currencies setted: ' + defaultCurrencies.map(c => c.currencyCode));
        })
        .catch((err) => {
            console.log(String(err));
        });



    cron.schedule('30 18 * * *', async () => {
        const now = new Date();
        console.log(`${now.getHours()}:${now.getMinutes()}, updating Fx Rates...`);
        try {
            const currencies = await db.readCurrencies({ activeOnly: true });
            const rates = await downloadAndSaveFxRates(currencies, db);
            console.log(`Success, ${rates.length} records fetched`);
        } catch (error) {
            console.log('! Error occured, Fx Rates not fetched !');
        }
    });
}

module.exports = initCurrencies;