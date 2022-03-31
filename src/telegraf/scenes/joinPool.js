const { Scenes: { BaseScene } } = require('telegraf');

const {
    menuItemNames,
    switchPoolKeyboard,
    poolSetupKeyboard,
    mainMenuKeyboard
} = require('../keyboards');

const joinPoolScene = new BaseScene('joinPoolScene');

joinPoolScene.enter(async ctx => {
    try {
        ctx.scene.state.pool = await ctx.connector.findPoolById(ctx.message.text.substring(6));

        if (ctx.pool) {
            return ctx.reply([
                `Currently you are in pool "${ctx.pool.name}."`,
                `Do you want to switch to pool "${ctx.scene.state.pool.name}"?`
            ].join(' '), switchPoolKeyboard);
        }

        const pool = await ctx.connector.joinPool(ctx.scene.state.pool, ctx.user);

        if (!pool) {
            ctx.scene.state.result = 'error';
            ctx.scene.state.pool = undefined;
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

joinPoolScene.action(menuItemNames.switchPoolInline.yAction, async ctx => {
    try {
        await ctx.answerCbQuery('');
        ctx.deleteMessage();

        const pool = await ctx.connector.joinPool(ctx.scene.state.pool, ctx.user);

        if (!pool) {
            ctx.scene.state.result = 'error';
            ctx.scene.state.pool = undefined;
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

joinPoolScene.action(menuItemNames.switchPoolInline.nAction, async ctx => {
    try {
        await ctx.answerCbQuery('');
        ctx.deleteMessage();

        ctx.scene.state.result = 'cancelled';
        return ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.result = String(err);
        return ctx.scene.leave();
    }
});

joinPoolScene.leave(async (ctx) => {
    try {
        if (ctx.scene.state.result === 'joined') {
            ctx.replyWithHTML(`✅ Pool <b>"${ctx.scene.state.pool.name}"</b> joined`, mainMenuKeyboard(ctx.pool));
        } else if (ctx.scene.state.result === 'error') {
            ctx.reply(
                'Cannot join pool: Something went wrong',
                poolSetupKeyboard(ctx.pool)
            );
        } else {
            ctx.reply(ctx.scene.state.result, poolSetupKeyboard(ctx.pool));
        }
    } catch (err) {
        ctx.reply('Error while leaving joinPoolScene');
    }
});

module.exports = joinPoolScene;