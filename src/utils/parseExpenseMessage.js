function parseExpenseMessage (message, defaultCurrency) {
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
    if (/(₴|ua.*|гр.*|г)/.test(currencyText)) currencyText = '₴';
    if (/(\$|us.*|дол.*)/.test(currencyText)) currencyText = '$';
    if (/(€|eu.*|ev.*|ев.*|єв*)/.test(currencyText)) currencyText = '€';

    if (!/(₴|\$|€)/.test(currencyText)) {
        descText = currencyText + ' ' + descText;
        currencyText = defaultCurrency;
    }

    const amount = parseInt(amountText);
    const currency = currencyText;
    const description = descText;

    const parsedExpenses = {
        message,
        amount,
        currency,
        description
    };

    return parsedExpenses;
}

module.exports = parseExpenseMessage;