const { Scenes: { BaseScene } } = require('telegraf');

const { managePoolKbNames, managePoolKeyboard } = require('../keyboards/managePoolKb');
const { cancelKeyboard } = require('../keyboards/cancelKb');

const showPoolCurrencies = require('../../utils/showPoolCurrencies');
const composePoolCurrenciesMsg = require('../../utils/composePoolCurrenciesMsg');

const changeMainCurrencyScene = new BaseScene('changeMainCurrencyScene');

changeMainCurrencyScene.enter(async ctx => {
    await showPoolCurrencies(ctx, ctx.pool);
    ctx.reply(managePoolKbNames.changeMainPoolCurrency.prompt, cancelKeyboard);
});

changeMainCurrencyScene.on('text', async ctx => {
    try {
        ctx.scene.state.menu = managePoolKeyboard(ctx.user, ctx.pool);

        if (ctx.message.text === 'Cancel') {
            ctx.scene.state.output = 'Main pool currency changing cancelled';
            return ctx.scene.leave();
        }

        const currencyCode = ctx.message.text.trim().toUpperCase();

        const currencies = (await ctx.db.readCurrencies({ currencyCodes: [currencyCode] }));
        if (currencies.length === 0) {
            return ctx.reply('It\'s not valid currency ISO code, please provide a valid one');
        }
        const currency = currencies[0];

        const poolCurrencies = await ctx.db.readPoolCurrencies(ctx.pool);
        const currencyInPool = poolCurrencies.some(c =>
            String(c.currency) === String(currency._id)
        );
        if (!currencyInPool) {
            ctx.scene.state.output = [
                `${currency.currencyCode} is not in pool yet. ` +
                `First, please add ${currency.currencyCode} to the pool`
            ].join('');
            ctx.scene.leave();
        }

        if ( String(currency._id) === String(ctx.pool.mainCurrency._id) ) {
            ctx.scene.state.output = `${currency.currencyCode} is already a main pool currency`;
            ctx.scene.leave();
        }

        const result = await ctx.db.setMainPoolCurrency(ctx.pool, currency);

        const output = composePoolCurrenciesMsg(result.rates);
        output.unshift(
            `Main pool currency changed to <b>${currency.currencyCode}</b>\n` +
            'Pool currencies & rates:\n'
        );

        ctx.scene.state.output = output.join('\n');
        ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

changeMainCurrencyScene.leave(async (ctx) => {
    if (ctx.scene.state.output) {
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
    }
});


module.exports = changeMainCurrencyScene;