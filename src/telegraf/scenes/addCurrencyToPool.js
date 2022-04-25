const { Scenes: { BaseScene } } = require('telegraf');

const { managePoolKbNames, managePoolKeyboard } = require('../keyboards/managePoolKb');
const { cancelKeyboard } = require('../keyboards/cancelKb');

const showPoolCurrencies = require('../../utils/showPoolCurrencies');
const composePoolCurrenciesMsg = require('../../utils/composePoolCurrenciesMsg');

const addCurrencyToPoolScene = new BaseScene('addCurrencyToPoolScene');

addCurrencyToPoolScene.enter(async ctx => {
    await showPoolCurrencies(ctx, ctx.pool);
    ctx.reply(managePoolKbNames.addCurrencyToPool.prompt, cancelKeyboard);
});

addCurrencyToPoolScene.on('text', async ctx => {
    try {
        ctx.scene.state.menu = managePoolKeyboard(ctx.user, ctx.pool);

        if (ctx.message.text === 'Cancel') {
            ctx.scene.state.output = 'Adding currency to pool cancelled';
            return ctx.scene.leave();
        }

        const currencyCode = ctx.message.text.trim().toUpperCase();

        const currencies = (await ctx.db.readCurrencies({ currencyCodes: [currencyCode] }));
        if (currencies.length === 0) {
            return ctx.reply('It\'s not valid currency ISO code, please provide a valid one');
        }
        const currency = currencies[0];

        const poolCurrencies = await ctx.db.readPoolCurrencies(ctx.pool);
        const currencyInPool = poolCurrencies.some(c => {
            return String(c.currency) === String(currency._id);
        });
        if (currencyInPool) {
            ctx.scene.state.output = `${currency.currencyCode} is already in pool`;
            return ctx.scene.leave();
        }

        const currencyAdded = await ctx.db.addPoolCurrencies(ctx.pool, [currency._id]);
        const output = composePoolCurrenciesMsg(currencyAdded);
        output.unshift('Currency added:');

        ctx.scene.state.output = output.join('\n');
        return ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

addCurrencyToPoolScene.leave(async (ctx) => {
    if (ctx.scene.state.output) {
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
    }
});


module.exports = addCurrencyToPoolScene;