const { Scenes: { BaseScene } } = require('telegraf');

const {
    menuItemNames,
    cancelKeyboard,
    poolSetupKeyboard
} = require('../keyboards');


const changeNicknameScene = new BaseScene('changeNicknameScene');

changeNicknameScene.enter(ctx => {
    ctx.reply(menuItemNames.changeNickname.prompt, cancelKeyboard);
});

changeNicknameScene.on('text', async ctx => {
    try {
        const nickname = ctx.message.text;
        ctx.scene.state.result = 'error';

        if (nickname === 'Cancel') {
            ctx.scene.state.result = 'cancelled';
            return ctx.scene.leave();
        }

        ctx.scene.state.user = await ctx.connector.changeNickname(ctx.user, nickname);
        ctx.scene.state.result = 'success';
        ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.result = String(err);
        ctx.scene.leave();
    }
});

changeNicknameScene.leave(async (ctx) => {
    if (ctx.scene.state.result === 'error') {
        return ctx.reply('Cannot change nickname: Something went wrong', poolSetupKeyboard(ctx.pool));
    }

    if (ctx.scene.state.result === 'cancelled') {
        return ctx.reply('Nickname changing cancelled', poolSetupKeyboard(ctx.pool));
    }

    ctx.replyWithHTML(
        `Your nickname changed to <b>"${ctx.scene.state.user.nick}"</b>`,
        poolSetupKeyboard(ctx.pool)
    );
});


module.exports = changeNicknameScene;