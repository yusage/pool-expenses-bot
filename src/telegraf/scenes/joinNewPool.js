const { Scenes: { BaseScene } } = require('telegraf');
const { cancelKeyboard, poolSetupKeyboard, mainMenuKeyboard } = require('../keyboards');


const joinNewPoolScene = new BaseScene('joinNewPoolScene');

joinNewPoolScene.enter(async ctx => {
    try {
        ctx.reply('Enter Id of a pool to join', cancelKeyboard);
    } catch (err) {
        ctx.scene.state.result = String(err);
        return ctx.scene.leave();
    }
});

joinNewPoolScene.hears('Cancel', async (ctx) => {
    try {
        ctx.scene.state.result = 'cancelled';
        return ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.result = String(err);
        return ctx.scene.leave();
    }
});

joinNewPoolScene.on('text', async (ctx) => {
    try {
        const newPool = await ctx.connector.findPoolById(ctx.message.text);
        const pool = await ctx.connector.joinPool(newPool, ctx.user);

        if (!pool) {
            ctx.scene.state.result = 'error';
            return ctx.scene.leave();
        }

        ctx.pool = pool;
        ctx.scene.state.pool = pool;
        ctx.scene.state.result = 'joined';

        ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.result = String(err);
        ctx.scene.leave();
    }
});

joinNewPoolScene.leave(async (ctx) => {
    if (ctx.scene.state.result === 'cancelled') {
        ctx.reply('Pool joining cancelled', poolSetupKeyboard(ctx.pool));
    } else if (ctx.scene.state.result === 'joined') {
        ctx.replyWithHTML(`Pool <b>"✅ ${ctx.scene.state.pool.name}"</b> joined`, mainMenuKeyboard(ctx.pool));
    } else if (ctx.scene.state.result === 'error') {
        ctx.reply(
            'Cannot join pool: Something went wrong',
            poolSetupKeyboard(ctx.pool)
        );
    } else {
        ctx.reply(ctx.scene.state.result, poolSetupKeyboard(ctx.pool));
    }
});

module.exports = joinNewPoolScene;