const { Scenes: { BaseScene } } = require('telegraf');

const { managePoolKbNames, managePoolKeyboard } = require('../keyboards/managePoolKb');
const { cancelKeyboard } = require('../keyboards/cancelKb');

const showPoolCurrencies = require('../../utils/showPoolCurrencies');

// scene to enter valid currency code
const setFxPoolRateScene = new BaseScene('setFxPoolRateScene');

setFxPoolRateScene.enter(async ctx => {
    await showPoolCurrencies(ctx, ctx.pool);
    ctx.reply(managePoolKbNames.setFxRateforPool.prompt, cancelKeyboard);
});

setFxPoolRateScene.on('text', async ctx => {
    try {
        ctx.scene.state.menu = managePoolKeyboard(ctx.user, ctx.pool);

        if (ctx.message.text === 'Cancel') {
            ctx.scene.state.output = 'Fx Rate setting cancelled';
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
        if (!currencyInPool) {
            ctx.scene.state.output = `${currency.currencyCode} is not assigned to this pool`;
            return ctx.scene.leave();
        }

        return ctx.scene.enter('setFxPoolRate2Scene', { currency });
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

setFxPoolRateScene.leave(async (ctx) => {
    if (ctx.scene.state.output) {
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
    }
});

// scene to enter valid fx rate and execute changes
const setFxPoolRate2Scene = new BaseScene('setFxPoolRate2Scene');

setFxPoolRate2Scene.enter(async ctx => {
    const currentRate = await ctx.db.readPoolCurrencies(ctx.pool, [ctx.scene.state.currency._id]);
    ctx.reply(
        `Current ${currentRate[0].currencyCode} fx rate is ` +
        `${currentRate[0].rate.toFixed(4)}. Please enter a new fx rate`
    );
});

setFxPoolRate2Scene.on('text', async ctx => {
    try {
        ctx.scene.state.menu = managePoolKeyboard(ctx.user, ctx.pool);

        if (ctx.message.text === 'Cancel') {
            ctx.scene.state.output = 'Fx Rate setting cancelled';
            return ctx.scene.leave();
        }

        const rate = parseFloat(ctx.message.text);
        if (!rate) return ctx.reply('Incorrect fx rate, please try again');

        const rateRecord = await ctx.db.setPoolCurrencyRate(
            ctx.pool,
            ctx.scene.state.currency,
            rate
        );

        ctx.scene.state.output =
            `New ${rateRecord.currencyCode} fx rate saved: ` +
            `${rateRecord.rate.toFixed(4)}`;
        return ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

setFxPoolRate2Scene.leave(async (ctx) => {
    if (ctx.scene.state.output) {
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
    }
});

module.exports = {
    setFxPoolRateScene,
    setFxPoolRate2Scene,
};