// const Currency = require('../../mongo-models/currency');
const send = require('../../utils/send');
const { adminToolsKbNames } = require('../keyboards/adminToolsKb');
const downloadAndSaveFxRates = require('../../utils/downloadAndSaveFxRates');
const downloadAndSaveCurrencies = require('../../utils/downloadAndSaveCurrencies');
const composeFxRatesMsg = require('../../utils/composeFxRatesMsg');

function adminTools(bot) {

    // handle "Show fx rates" button - show all bot fx rates
    bot.hears(adminToolsKbNames.showFxRates.title, async ctx => {
        const currenciesObj = await ctx.db.readCurrencies({ activeOnly: true });
        const currenciesId = currenciesObj.map((c) => c._id);

        console.log(currenciesId);
        const allRates = [];
        for (const currencyToId of currenciesId) {
            const rates = await ctx.db.readFxRates({
                currenciesFromId: currenciesId,
                currencyToId,
            });
            allRates.push(...rates);
        }

        ctx.reply(composeFxRatesMsg(allRates).join('\n'));

    });

    // handle "Show currencies" button - showing all system currencies
    bot.hears(adminToolsKbNames.showCurrencies.title, async ctx => {
        ctx.reply(adminToolsKbNames.showCurrencies.prompt);
        const defaultCurrencies = await ctx.db.readCurrencies({ defaultOnly: true });
        const activeCurrencies = await ctx.db.readCurrencies({ activeOnly: true });
        const allCurrencies = await ctx.db.readCurrencies({});

        let output = [];

        if (defaultCurrencies.length > 0) {
            output.push('<b>Default currencies:</b>');
            for (const c of defaultCurrencies) {
                output.push(`${c.currencyCode} (${c.symbol}) - ${c.description}, ${c.mask}`);
            }
            output.push('');
        }

        if (activeCurrencies.length > 0) {
            output.push('<b>Active currencies:</b>');
            for (const c of activeCurrencies) {
                output.push(`${c.currencyCode} (${c.symbol}) - ${c.description}, ${c.mask}`);
            }
            output.push('');
        }

        if (allCurrencies.length === 0)
        {
            output.push('There is no currencies in bot setup');
        } else {
            output.push('<b>Full list of currencies:</b>');
            for (const c of allCurrencies) {
                output.push(`${c.currencyCode} (${c.symbol}) - ${c.description}, ${c.mask}`);
            }
        }

        await send(ctx, output.join('\n'));
    });

    // handle "Add fx Rate" button - add fx rate for bot
    bot.hears(adminToolsKbNames.addFxRate.title, async ctx => {
        ctx.scene.enter('addFxRateScene');
    });

    // handle "Add new currency" button - add new currency to bot
    bot.hears(adminToolsKbNames.createBotCurrency.title, async ctx => {
        ctx.scene.enter('createBotCurrencyScene');
    });

    // handle "Download fx rates from web" button - download bot fx rates from web
    bot.hears(adminToolsKbNames.downloadFxRates.title, async ctx => {
        ctx.reply(adminToolsKbNames.downloadFxRates.prompt);

        const currencies = await ctx.db.readCurrencies({
            activeOnly: true
        });
        if (currencies.length === 0) return ctx.reply(
            'Cannot download Fx Rates: ' +
            'There is no active currencies'
        );

        const rates = await downloadAndSaveFxRates(currencies, ctx.db);

        const output = composeFxRatesMsg(rates);
        output.unshift(['FX Rates downloaded from web:\n']);

        ctx.reply(output.join('\n'));
    });

    // handle "Download currencies from web" button
    bot.hears(adminToolsKbNames.downloadCurrencies.title, async ctx => {
        ctx.reply(adminToolsKbNames.downloadCurrencies.prompt);
        const { errors, updated, created } = await downloadAndSaveCurrencies(ctx.db);

        let output = [];
        const resultsLength = updated.length + created.length + errors.length;

        if (resultsLength === 0) {
            output.push('No currencies to create or update');
        }
        if (errors.length > 0) {
            output.push('<b>Errors:<b>', ...errors, '');
        }
        if (updated.length > 0) {
            output.push('<b>Currencies updated:</b>', ...updated, '');
        }
        if (created.length > 0) {
            output.push('<b>Currencies created:</b>', ...created, '');
        }

        ctx.replyWithHTML(output.join('\n'));
    });

}

module.exports = adminTools;