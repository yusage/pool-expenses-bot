const { Scenes: { BaseScene } } = require('telegraf');

const { mainMenuKeyboard } = require('../keyboards/mainMenuKb');
const { myPoolsKeyboard } = require('../keyboards/myPoolsKb');
const { cancelKeyboard } = require('../keyboards/cancelKb');

const joinNewPoolScene = new BaseScene('joinNewPoolScene');

joinNewPoolScene.enter(async ctx => {
    try {
        ctx.reply('Enter Id of a pool to join', cancelKeyboard);
    } catch (err) {
        ctx.scene.state.result = String(err);
        return ctx.scene.leave();
    }
});

joinNewPoolScene.on('text', async (ctx) => {
    try {
        ctx.scene.state.menu = myPoolsKeyboard(ctx.user, ctx.pool);

        if (ctx.message.text === 'Cancel') {
            ctx.scene.state.output = 'Pool joining cancelled';
            return ctx.scene.leave();
        }

        const newPool = await ctx.db.findPoolById(ctx.message.text);
        const pool = await ctx.db.joinPool(newPool, ctx.user);

        if (!pool) {
            ctx.scene.state.output = 'Cannot join pool: Something went wrong';
            return ctx.scene.leave();
        }

        ctx.pool = pool;
        ctx.scene.state.output = `Pool <b>"✅ ${pool.name}"</b> joined`;
        ctx.scene.state.menu = mainMenuKeyboard(ctx.user, ctx.pool);

        ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

joinNewPoolScene.leave(async (ctx) => {
    if (ctx.scene.state.output) {
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
    }
});

module.exports = joinNewPoolScene;