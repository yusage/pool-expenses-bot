const { Scenes: { BaseScene } } = require('telegraf');

const { mainMenuKeyboard } = require('../keyboards/mainMenuKb');
const { myPoolsKeyboard } = require('../keyboards/myPoolsKb');
const { switchPoolKeyboard, inlineKbNames } = require('../keyboards/inlineKb');

const joinPoolScene = new BaseScene('joinPoolScene');

joinPoolScene.enter(async ctx => {
    try {
        ctx.scene.state.menu = myPoolsKeyboard(ctx.user, ctx.pool);

        ctx.scene.state.pool = await ctx.db.findPoolById(ctx.message.text.substring(6));

        if (ctx.pool) {
            return ctx.reply([
                `Currently you are in pool "${ctx.pool.name}."`,
                `Do you want to switch to pool "${ctx.scene.state.pool.name}"?`
            ].join(' '), switchPoolKeyboard);
        }

        const pool = await ctx.db.joinPool(ctx.scene.state.pool, ctx.user);

        if (!pool) {
            ctx.scene.state.output = 'Cannot join pool: Something went wrong';
            ctx.scene.state.pool = undefined;
            return ctx.scene.leave();
        }

        ctx.pool = pool;
        ctx.scene.state.pool = pool;
        ctx.scene.state.output = `✅ Pool <b>"${pool.name}"</b> joined`;
        ctx.scene.state.menu = mainMenuKeyboard(ctx.user, ctx.pool);

        ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

joinPoolScene.action(inlineKbNames.switchPoolInline.yAction, async ctx => {
    try {
        await ctx.answerCbQuery('');
        ctx.deleteMessage();

        const pool = await ctx.db.joinPool(ctx.scene.state.pool, ctx.user);

        if (!pool) {
            ctx.scene.state.output = 'Cannot join pool: Something went wrong';
            ctx.scene.state.pool = undefined;
            return ctx.scene.leave();
        }

        ctx.pool = pool;
        ctx.scene.state.output = `✅ Pool <b>"${pool.name}"</b> joined`;
        ctx.scene.state.menu = mainMenuKeyboard(ctx.user, ctx.pool);

        ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

joinPoolScene.action(inlineKbNames.switchPoolInline.nAction, async ctx => {
    try {
        await ctx.answerCbQuery('');
        ctx.deleteMessage();
        return ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        return ctx.scene.leave();
    }
});

joinPoolScene.leave(async (ctx) => {
    if (ctx.scene.state.output) {
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
    }
});

module.exports = joinPoolScene;