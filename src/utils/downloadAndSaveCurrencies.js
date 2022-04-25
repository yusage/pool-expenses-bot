const downloadCurrencies = require('./downloadCurrencies');

async function downloadAndSaveCurrencies(db) {
    const currenciesData = await downloadCurrencies();
    let errors = [];
    let updated = [];
    let created = [];

    for (const code of Object.keys(currenciesData)) {
        const existing = await db.readCurrencies({
            currencyCodes: [code]
        });

        if (existing.length > 1) {
            errors.push(
                `${existing[0].currencyCode}: ` +
                'Currency code is not unique!'
            );

        } else if (existing.length === 1 && existing[0].description !== currenciesData[code].description) {
            existing[0].description = currenciesData[code].description;
            await existing[0].save();
            updated.push(
                `${existing[0].currencyCode}: ` +
                `${existing[0].description}`
            );

        } else if (existing.length === 0) {
            const newCurrency = await db.createCurrency({
                currencyCode: code,
                symbol: code,
                description: currenciesData[code].description,
                mask: `(${code.toLowerCase()})`,
                isDefault: false,
                isActive: false,
            });
            created.push(
                `${newCurrency.currencyCode}: ` +
                `${newCurrency.description}`
            );
        }

    }

    return { errors, updated, created };
}

module.exports = downloadAndSaveCurrencies;