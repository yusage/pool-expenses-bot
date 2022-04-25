const { Scenes: { BaseScene } } = require('telegraf');

const { managePoolKbNames, managePoolKeyboard } = require('../keyboards/managePoolKb');
const { cancelKeyboard } = require('../keyboards/cancelKb');

const showPoolCurrencies = require('../../utils/showPoolCurrencies');

const removeCurrencyFromPoolScene = new BaseScene('removeCurrencyFromPoolScene');

removeCurrencyFromPoolScene.enter(async ctx => {
    await showPoolCurrencies(ctx, ctx.pool);
    ctx.reply(managePoolKbNames.removeCurrencyFromPool.prompt, cancelKeyboard);
});

removeCurrencyFromPoolScene.on('text', async ctx => {
    try {

        ctx.scene.state.menu = managePoolKeyboard(ctx.user, ctx.pool);

        if (ctx.message.text === 'Cancel') {
            ctx.scene.state.output = 'Removing a currency from pool cancelled';
            return ctx.scene.leave();
        }

        const currencyCode = ctx.message.text.toUpperCase().trim();
        const currencies = (await ctx.db.readCurrencies({ currencyCodes: [currencyCode] }));
        if (currencies.length === 0) {
            return ctx.reply(`"${ctx.message.text}" is not valid currency ISO code, please provide a valid one`);
        }
        const currency = currencies[0];

        const poolCurrencies = await ctx.db.readPoolCurrencies(ctx.pool);
        const currencyInPool = poolCurrencies.some(c =>
            String(c.currency) === String(currency._id)
        );
        if (!currencyInPool) {
            return ctx.reply(
                `"${currencyCode}" is not in assigned to the current pool, ` +
                'please enter a valid pool currency ISO code'
            );
        }

        if (!await ctx.db.isPoolCurrencyRemovable(ctx.pool, currency)) {
            ctx.scene.state.output = `Cannot remove ${currency.currencyCode} from pool: ` +
                'There is expenses in this currency';
            return ctx.scene.leave();
        }

        const isRemoved = await ctx.db.removeCurrencyFromPool(ctx.pool, currency);
        console.log(isRemoved);
        if (isRemoved) {
            ctx.scene.state.output = `${currency.currencyCode} removed from pool`;
        } else ctx.scene.state.output = `Cannot remove ${currency.currencyCode} `+
            'from pool: something went wrong';
        return ctx.scene.leave();


    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

removeCurrencyFromPoolScene.leave(async (ctx) => {
    if (ctx.scene.state.output)
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
});

module.exports = removeCurrencyFromPoolScene;