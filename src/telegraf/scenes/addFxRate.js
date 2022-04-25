const { Scenes: { BaseScene } } = require('telegraf');
const Currency = require('../../mongo-models/currency');

const { adminKeyboard, adminToolsKbNames } = require('../keyboards/adminToolsKb');
const { cancelKeyboard } = require('../keyboards/cancelKb');

// addFxRate Scene:
const addFxRateScene = new BaseScene('addFxRateScene');

addFxRateScene.enter(ctx => {
    ctx.reply(adminToolsKbNames.addFxRate.prompt, cancelKeyboard);
});

addFxRateScene.on('text', async ctx => {
    try {
        ctx.scene.state.menu = adminKeyboard;

        if (ctx.message.text === 'Cancel') {
            ctx.scene.state.output = 'Fx Rate adding cancelled';
            return ctx.scene.leave();
        }

        const msgParts = ctx.message.text.trim().split(' ');
        const currencyFromCode = msgParts[0].toUpperCase();
        const currencyToCode = msgParts[1].toUpperCase();
        const rate = parseFloat(msgParts[2]);

        const currencyFrom = await Currency.findOne({ currencyCode: currencyFromCode });
        const currencyTo = await Currency.findOne({ currencyCode: currencyToCode });
        const source = 'entered by DEV';

        if (!currencyFrom || !currencyTo) {
            ctx.scene.state.output = 'Cannot add fx rate: incorrect input format';
            return ctx.scene.leave();
        }
        const fxRate = await ctx.db.updateFxRate({
            currencyFromId: currencyFrom._id,
            currencyToId: currencyTo._id,
            rate,
            source,
        });

        ctx.scene.state.output = [
            '✏️ Fx Rate added: ',
            `${fxRate.currencyFrom.currencyCode}/${fxRate.currencyTo.currencyCode}: `,
            `${fxRate.rate.toFixed(4)} (${fxRate.source})`,
        ].join('');

        ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

addFxRateScene.leave(async (ctx) => {
    if (ctx.scene.state.output) {
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
    }
});


module.exports = addFxRateScene;