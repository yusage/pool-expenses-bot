const { managePoolKbNames } = require('../keyboards/managePoolKb');
const {  myPoolsKeyboard } = require('../keyboards/myPoolsKb');
const showPoolCurrencies = require('../../utils/showPoolCurrencies');
const composePoolCurrenciesMsg = require('../../utils/composePoolCurrenciesMsg');


function managePool(bot) {

    // handling 'View pool currencies' button: showing pool currencies & rates
    bot.hears(managePoolKbNames.viewPoolCurrencies2.title, async ctx => {
        await showPoolCurrencies(ctx, ctx.pool);
    });

    // handling 'Add pool currency' button: running scene
    bot.hears(managePoolKbNames.addCurrencyToPool.title, async ctx => {
        ctx.scene.enter('addCurrencyToPoolScene');
    });

    // handling 'Change main currency' button: running "Change main currency" scene
    bot.hears(managePoolKbNames.changeMainPoolCurrency.title, async ctx => {
        ctx.scene.enter('changeMainCurrencyScene');
    });

    // handling 'Remove pool currency' button: running scene
    bot.hears(managePoolKbNames.removeCurrencyFromPool.title, async ctx => {
        ctx.scene.enter('removeCurrencyFromPoolScene');
    });

    // handling 'Download FX rates' button: updating FX rates from bot db
    bot.hears(managePoolKbNames.downloadFxRatesforPool.title, async ctx => {
        ctx.reply(managePoolKbNames.downloadFxRatesforPool.prompt);

        await ctx.db.updatePoolCurrencyRates(ctx.pool);
        const rates = await ctx.db.readPoolCurrencies(ctx.pool);

        const output = composePoolCurrenciesMsg(rates);
        output.unshift(
            'Pool currency rates updated:\n\n' +
            `Main pool currency: <b>${ctx.pool.mainCurrency.code}</b>`
        );

        await ctx.replyWithHTML(output.join('\n'));
    });

    // handling 'Manually set FX rate' button: running scene
    bot.hears(managePoolKbNames.setFxRateforPool.title, async ctx => {
        ctx.scene.enter('setFxPoolRateScene');
    });

}

module.exports = managePool;