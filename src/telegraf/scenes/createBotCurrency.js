const { Scenes: { BaseScene } } = require('telegraf');

const { adminToolsKbNames } = require('../keyboards/adminToolsKb');
const { adminKeyboard } = require('../keyboards/adminToolsKb');
const { cancelKeyboard } = require('../keyboards/cancelKb');

// addCurrency Scene:
const createBotCurrencyScene = new BaseScene('createBotCurrencyScene');

createBotCurrencyScene.enter(ctx => {
    ctx.reply(adminToolsKbNames.createBotCurrency.prompt, cancelKeyboard);
});

createBotCurrencyScene.on('text', async ctx => {
    try {
        ctx.scene.state.menu = adminKeyboard;

        if (ctx.message.text === 'Cancel') {
            ctx.scene.state.output = 'New currency creation cancelled';
            return ctx.scene.leave();
        }

        const mgsParts = ctx.message.text.trim().split(' ');
        if (mgsParts.length !== 4) {
            return ctx.reply([
                'Cannot create currency: incorrect input format',
                'Example of correct input format:',
                'ETH Ξ Ethereum (eth|эф*)',
            ].join('\n'));
        }

        const currencyCode = mgsParts[0].toUpperCase();
        const symbol = mgsParts[1];
        const description = mgsParts[2];
        const mask = mgsParts[3].toLowerCase();

        const currency = await ctx.db.createCurrency({
            currencyCode,
            symbol,
            description,
            mask,
            isDefault: false,
            isActive: false,
        });

        ctx.scene.state.output = `New currency <b>"${currency.currencyCode}"</b> created`;
        ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

createBotCurrencyScene.leave(async (ctx) => {
    if (ctx.scene.state.output) {
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
    }
});


module.exports = createBotCurrencyScene;