function composeExpenseLine ({ amount, currency, description, baseAmount, baseCurrency }) {
    if (baseAmount && baseCurrency && baseCurrency !== currency)
    {
        return [
            `${amount.toFixed(0)}${currency}, ${description}`,
            ` = ${baseAmount.toFixed(0)}${baseCurrency}`
        ].join('');
    }
    else {
        return `${amount.toFixed(0)}${currency}, ${description}`;
    }

}

module.exports = composeExpenseLine;