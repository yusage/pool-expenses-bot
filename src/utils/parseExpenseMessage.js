const PoolCurrency = require('../mongo-models/poolCurrency');

async function parseExpenseMessage (pool, message) {
    const msgParts = message.replace(/\s+/g, ' ').trim().split('');

    let activePart = 'amount';
    let amountText = '';
    let currencyText = '';
    let descText = '';

    msgParts.forEach((char) => {
        if (activePart === 'amount')
        {
            if ( /^\d/.test(char) ) {
                return amountText += char;
            }
            activePart = 'currency';
            if (char === ' ') return;
        }

        if (activePart === 'currency')
        {
            if (char !== ' ') {
                return currencyText += char;
            }
            return activePart = 'description';
        }

        if (activePart === 'description')
        {
            return descText += char;
        }

    });

    currencyText = currencyText.toLowerCase();
    let currency = undefined;

    const poolCurrencies = await PoolCurrency.find({ pool: pool._id });

    for (const c of poolCurrencies) {
        const mask = new RegExp(c.mask);
        if ( mask.test(currencyText) ) currency = c.currency;
    }

    if (!currency) {
        descText = currencyText + ' ' + descText;
        currency = pool.mainCurrency._id;
    }

    const amount = parseInt(amountText);
    if (!amount) return;

    while (descText[0] === ',' || descText[0] === ' ') {
        descText = descText.substring(1);
    }
    const description = descText.trim();

    const parsedExpenses = {
        message,
        amount,
        currency,
        description
    };

    return parsedExpenses;
}

module.exports = parseExpenseMessage;