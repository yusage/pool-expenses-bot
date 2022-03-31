const { Scenes: { BaseScene } } = require('telegraf');

const {
    menuItemNames,
    cancelKeyboard,
    poolSetupKeyboard
} = require('../keyboards');


// createPool Scene:
const createPoolScene = new BaseScene('createPoolScene');

createPoolScene.enter(ctx => {
    ctx.reply(menuItemNames.createPool.prompt, cancelKeyboard);
});

createPoolScene.on('text', async ctx => {
    try {
        const poolName = ctx.message.text;
        ctx.scene.state.pool = undefined;
        ctx.scene.state.result = 'error';

        if (poolName === 'Cancel') {
            ctx.scene.state.result = 'cancelled';
            return ctx.scene.leave();
        }

        ctx.scene.state.pool = await ctx.connector.createPool(poolName, ctx.teleUserId);
        ctx.scene.state.result = 'created';
        ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.result = String(err);
        ctx.scene.leave();
    }
});

createPoolScene.leave(async (ctx) => {
    if (ctx.scene.state.result === 'error') {
        return ctx.reply('Cannot create new pool: Something went wrong', poolSetupKeyboard(ctx.pool));
    }

    if (ctx.scene.state.result === 'cancelled') {
        return ctx.reply('New pool creation cancelled', poolSetupKeyboard(ctx.pool));
    }

    ctx.replyWithHTML([
        `✏️ New pool <b>"${ctx.scene.state.pool.name}"</b> created`,
        `To join it, use /join_${String(ctx.scene.state.pool._id)}`
    ].join('\n'), poolSetupKeyboard(ctx.pool));
});


module.exports = createPoolScene;