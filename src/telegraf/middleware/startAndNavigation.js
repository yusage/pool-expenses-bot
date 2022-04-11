const { menuItemNames, poolSetupKeyboard, mainMenuKeyboard, } = require('../keyboards');
const composeUserName = require('../../utils/composeUserName');

function startAndNavigation(bot) {

    // handling 'Start' command
    bot.command('start', async ctx => {
        const { userName, defaultNick } = composeUserName(ctx.from.first_name, ctx.from.last_name);
        ctx.user = await ctx.connector.startBotSession(ctx.teleUserId, userName, defaultNick, ctx.chat.id);

        await ctx.replyWithHTML([
            '<b>Welcome to poolExpenses bot!</b>\n',
            `I will call you <b>${ctx.user.nick}</b>.`,
            'To change this nick, use /changeNickname'
        ].join('\n'), mainMenuKeyboard(ctx.pool));
    });

    // handling 'Pool setup' button: switching to 'Pool setup' menu
    bot.hears(menuItemNames.poolSetup.title, async (ctx, next) => {
        ctx.reply(menuItemNames.poolSetup.prompt, poolSetupKeyboard(ctx.pool));
        next();
    });

    // handling 'Back to main menu' button: swithing to main menu
    bot.hears(menuItemNames.toMainMenu.title, async ctx => {
        await ctx.reply(menuItemNames.toMainMenu.prompt, mainMenuKeyboard(ctx.pool));
    });

}

module.exports = startAndNavigation;