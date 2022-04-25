const { Markup } = require('telegraf');
const { myPoolsKbNames } =require('./myPoolsKb');

const managePoolKbNames = {
    viewPoolCurrencies2: {
        title: 'View pool currencies',
        prompt: 'Here is pool currencies:'
    },
    changeMainPoolCurrency: {
        title: 'Change main currency',
        prompt: 'Please enter ISO code of a new pool main currency:'
    },
    addCurrencyToPool: {
        title: 'Add pool currency',
        prompt: 'Please enter ISO code (EUR, USD, ...) of a currency to be added:'
    },
    removeCurrencyFromPool: {
        title: 'Remove pool currency',
        prompt: 'Please enter ISO code (EUR, USD, ...) of a currency to be removed:'
    },
    downloadFxRatesforPool: {
        title: 'Download FX rates',
        prompt: 'Updating FX rates from web...'
    },
    setFxRateforPool: {
        title: 'Manually set FX rate',
        prompt: 'Please enter ISO code (EUR, USD, PLN ...) of a currency to set FX rate:'
    },
};

function managePoolKeyboard(user, pool) {
    if (user === pool) console.log(user);
    const menu = [
        [
            managePoolKbNames.viewPoolCurrencies2.title,
            managePoolKbNames.changeMainPoolCurrency.title,
        ],
        [
            managePoolKbNames.addCurrencyToPool.title,
            managePoolKbNames.removeCurrencyFromPool.title,
        ],
        [
            managePoolKbNames.downloadFxRatesforPool.title,
            managePoolKbNames.setFxRateforPool.title,
        ],
        [
            myPoolsKbNames.toMainMenu.title,
        ],
    ];

    return Markup.keyboard(menu).resize();
}

module.exports = {
    managePoolKbNames,
    managePoolKeyboard,
};

