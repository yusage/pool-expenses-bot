const { Scenes: { BaseScene } } = require('telegraf');

const { userSettingsKbNames } = require('../keyboards/userSettingsKb');
const { cancelKeyboard } = require('../keyboards/cancelKb');
const { myPoolsKeyboard } = require('../keyboards/myPoolsKb');


const changeNicknameScene = new BaseScene('changeNicknameScene');

changeNicknameScene.enter(ctx => {
    ctx.reply(userSettingsKbNames.changeNickname.prompt, cancelKeyboard);
});

changeNicknameScene.on('text', async ctx => {
    try {
        ctx.scene.state.menu = myPoolsKeyboard(ctx.user, ctx.pool);

        const nickname = ctx.message.text;
        ctx.scene.state.result = 'error';

        if (nickname === 'Cancel') {
            ctx.scene.state.output = 'Nickname changing cancelled';
            return ctx.scene.leave();
        }

        const user = await ctx.db.changeNickname(ctx.user, nickname);

        ctx.scene.state.output = `Your nickname changed to <b>"${user.nick}"</b>`;
        ctx.scene.leave();
    } catch (err) {
        ctx.scene.state.output = String(err);
        ctx.scene.leave();
    }
});

changeNicknameScene.leave(async (ctx) => {
    if (ctx.scene.state.output) {
        await ctx.replyWithHTML(ctx.scene.state.output, ctx.scene.state.menu);
    }
});


module.exports = changeNicknameScene;