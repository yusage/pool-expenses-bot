const { mainMenuKeyboard } = require('../keyboards/mainMenuKb');
const composeUserName = require('../../utils/composeUserName');

function slashCommands(bot) {

    // handling '/start' command
    bot.command('start', async ctx => {
        const { userName, defaultNick } = composeUserName(ctx.from.first_name, ctx.from.last_name);
        ctx.user = await ctx.db.startBotSession(ctx.teleUserId, userName, defaultNick, ctx.chat.id);

        await ctx.replyWithHTML([
            '<b>Welcome to poolExpenses bot!</b>\n',
            `I will call you <b>${ctx.user.nick}</b>.`,
            'To change this nick, use /changeNickname'
        ].join('\n'), await mainMenuKeyboard(ctx.user));
    });

    // handling /join_<pollId> message
    bot.hears(/\/join_.*/, async ctx => {
        ctx.scene.enter('joinPoolScene');
    });

    // handling /joinNewPool message
    bot.hears('/joinNewPool', async ctx => {
        ctx.scene.enter('joinNewPoolScene');
    });

}

module.exports = slashCommands;