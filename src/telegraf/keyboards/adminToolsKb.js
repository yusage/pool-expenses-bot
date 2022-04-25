const { Markup } = require('telegraf');
const { myPoolsKbNames } = require('./myPoolsKb');

const adminToolsKbNames = {
    showFxRates: {
        title: 'Show fx Rates',
        prompt: 'Here are fx Rates:'
    },
    showCurrencies: {
        title: 'Show currencies',
        prompt: 'Here are currencies:'
    },
    addFxRate: {
        title: 'Add fx Rate',
        prompt: 'Please enter fx Rate:\nCurrencyFrom CurrencyTo Rate (USD UAH 26.3100)'
    },
    createBotCurrency: {
        title: 'Add currency',
        prompt: [
            'Please enter data for a new currency. Input format is:',
            '<currency code> <short symbol> <description> <mask>',
            'Example: ETH Ξ Ethereum (eth|эф*)',
        ].join('\n')
    },
    downloadFxRates: {
        title: 'Download fx Rates from web',
        prompt: 'Downloading fx Rates from web...'
    },
    downloadCurrencies: {
        title: 'Download currencies from web',
        prompt: 'Downloading currencies from web...'
    },
};

const adminKeyboard = Markup.keyboard([
    [
        adminToolsKbNames.showFxRates.title,
        adminToolsKbNames.showCurrencies.title,
    ],
    [
        adminToolsKbNames.addFxRate.title,
        adminToolsKbNames.createBotCurrency.title,
    ],
    [
        adminToolsKbNames.downloadFxRates.title,
        adminToolsKbNames.downloadCurrencies.title,
    ],
    [
        myPoolsKbNames.toMainMenu.title,
    ],
]).resize();

module.exports = {
    adminToolsKbNames,
    adminKeyboard,
};