const moment = require('moment');
const { Scenes: { BaseScene } } = require('telegraf');

const { cancelKeyboard } = require('../keyboards/cancelKb');
const { myPoolsKeyboard, myPoolsKbNames } = require('../keyboards/myPoolsKb');

const createPoolScene = new BaseScene('createPoolScene');
const mainPoolCurrencyScene = new BaseScene('mainPoolCurrencyScene');

// createPool Scene - asking for Pool name:
createPoolScene.enter(ctx => {
    ctx.reply(myPoolsKbNames.createPool.prompt, cancelKeyboard);
});

createPoolScene.on('text', async ctx => {
    try {
        if (ctx.message.text === 'Cancel') {
            ctx.scene.state.output = 'New pool creation cancelled';
            return ctx.scene.leave();
        }

        return ctx.scene.enter('mainPoolCurrencyScene', { poolName: ctx.message.text });
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

createPoolScene.leave(async (ctx) => {
    ctx.scene.state.menu = myPoolsKeyboard(ctx.user, ctx.pool);
    if (ctx.scene.state.output)
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
});

// mainPoolCurrency Scene - asking for Pool main currency, creaing a Pool:
mainPoolCurrencyScene.enter(ctx => {
    ctx.reply(
        'Please enter a code of a pool main currency (ISO code, like USD or UAH)',
        cancelKeyboard
    );
});

mainPoolCurrencyScene.on('text', async ctx => {
    try {
        if (ctx.message.text === 'Cancel') {
            ctx.scene.state.output = 'New pool creation cancelled';
            return ctx.scene.leave();
        }

        const currencyCode = ctx.message.text.toUpperCase().trim();
        const mainCurrency = await ctx.db.readCurrencies({ currencyCodes: [currencyCode] });
        if (mainCurrency.length !== 1) {
            return ctx.reply(
                `"${currencyCode}" is not ISO currency code. ` +
                'Please enter a valid currency code.'
            );
        }

        ctx.scene.state.pool = await ctx.db.createPool(
            ctx.scene.state.poolName,
            ctx.teleUserId,
            mainCurrency[0]._id
        );
        if (!ctx.scene.state.pool) {
            ctx.scene.state.output = 'Cannot create new pool: Something went wrong';
            return ctx.scene.leave();
        }

        const pool = await ctx.db.findPoolById(ctx.scene.state.pool._id);
        const output = [
            `✏️ New pool <b>"${pool.name}"</b> created\n`,
            `To join it, use /join_${String(pool._id)}\n\n`,
            '<b>Main pool currency</b> is set to ',
            `<b>${pool.mainCurrency.code}</b> `,
            `(${pool.mainCurrency.symbol})\n`,
            'To change it, use /mainCurrency\n\n',
            '<b>Default currencies</b> assigned to the pool:\n',
        ];
        for (const c of pool.currencies) {
            output.push([
                `${c.currencyCode} (${c.symbol}): ${c.rate.toFixed(4)} `,
                `${c.currencyCode}/${pool.mainCurrency.code} `,
                `(${c.source}, ${moment(c.setDate).format('DD.MM.YYYY')})\n`,
            ].join(''));
        }
        output.push('To add or remove currency from the pool, use /poolCurrencies');

        ctx.scene.state.output = output.join('');
        return ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

mainPoolCurrencyScene.leave(async (ctx) => {
    ctx.scene.state.menu = myPoolsKeyboard(ctx.user, ctx.pool);
    if (ctx.scene.state.output)
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
});

module.exports = {
    createPoolScene,
    mainPoolCurrencyScene,
};