const { Markup } = require('telegraf');
const { getPlaceholder } = require('../keyboards/placeholders');
const { myPoolsKbNames } = require('./myPoolsKb');

const mainMenuKbNames = {
    viewPoolExpenses: {
        title: '🔎 View expenses',
        prompt: 'Here is pool expenses!'
    },
    viewPoolCurrencies: {
        title: '💲 View currencies',
        prompt: 'Here is pool currencies:'
    },
    userSettings: {
        title: '🚹 User settings',
        prompt: 'Here is user settings!'
    },
    myPools: {
        title: '📚 My pools',
        prompt: 'Here is "My pools" menu!'
    },
    managePool: {
        title: '🔧 Manage current pool',
        prompt: 'Manage current pool'
    },
    adminTools: {
        title: '🛠 Admin tools',
        prompt: 'Here is Admin tools!'
    },
};

function mainMenuKeyboard(user, pool) {
    const menu = [];
    if (pool) menu.push(
        [
            mainMenuKbNames.viewPoolExpenses.title,
            mainMenuKbNames.viewPoolCurrencies.title,
        ],
        [
            mainMenuKbNames.userSettings.title,
            mainMenuKbNames.myPools.title,
        ],
    ); else menu.push(
        [
            myPoolsKbNames.viewJoinPools.title,
        ],
        [
            myPoolsKbNames.createPool.title,
            mainMenuKbNames.userSettings.title,
        ],
    );

    if ( pool && String(pool.ownerId) === String(user._id) ) {
        menu.push([ mainMenuKbNames.managePool.title ]);
    }

    if (user.teleUserId == process.env.ADMIN_TELE_ID) {
        menu.push([ mainMenuKbNames.adminTools.title]);
    }
    return Markup.keyboard(menu).resize().placeholder(getPlaceholder(user, pool));
}

module.exports = {
    mainMenuKbNames,
    mainMenuKeyboard,
};