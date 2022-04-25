const { mainMenuKbNames } = require('../keyboards/mainMenuKb');
const { expenseReportsKeyboard } = require('../keyboards/viewExpensesKb');
const { userSettingsKeyboard } = require('../keyboards/userSettingsKb');
const { myPoolsKeyboard } = require('../keyboards/myPoolsKb');
const { managePoolKeyboard } = require('../keyboards/managePoolKb');
const { adminKeyboard } = require('../keyboards/adminToolsKb');
const showPoolCurrencies = require('../../utils/showPoolCurrencies');


function mainMenu(bot) {

    // handling 'View expenses' button: switching to 'View expenses' menu
    bot.hears(mainMenuKbNames.viewPoolExpenses.title, async ctx => {
        ctx.reply(mainMenuKbNames.viewPoolExpenses.prompt, expenseReportsKeyboard);
    });

    // handling 'View currencies' button: showing pool currencies & rates
    bot.hears(mainMenuKbNames.viewPoolCurrencies.title, async ctx => {
        await showPoolCurrencies(ctx, ctx.pool);
    });

    // handling 'User settings' button: switching to 'User settings' menu
    bot.hears(mainMenuKbNames.userSettings.title, async (ctx) => {
        ctx.reply(mainMenuKbNames.userSettings.prompt, userSettingsKeyboard);
    });

    // handling 'My pools' button: switching to 'My pools' menu
    bot.hears(mainMenuKbNames.myPools.title, async (ctx) => {
        ctx.reply(mainMenuKbNames.myPools.prompt, myPoolsKeyboard(ctx.user, ctx.pool));
    });

    // handling 'Manage current pool' button: switching to 'manage pool' menu
    bot.hears(mainMenuKbNames.managePool.title, async (ctx, next) => {
        if ( String(ctx.user._id) !== String(ctx.pool.ownerId) ) next();
        ctx.reply(mainMenuKbNames.managePool.prompt, managePoolKeyboard(ctx.user, ctx.pool));
        next();
    });

    // handling 'Admin tools' button: switching to 'Admin tools' menu
    bot.hears(mainMenuKbNames.adminTools.title, async (ctx, next) => {
        ctx.reply(mainMenuKbNames.adminTools.prompt, adminKeyboard);
        next();
    });

}

module.exports = mainMenu;