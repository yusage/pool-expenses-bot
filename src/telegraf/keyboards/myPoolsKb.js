const { Markup } = require('telegraf');
const { getPlaceholder } = require('../keyboards/placeholders');

const myPoolsKbNames = {
    viewJoinPools: {
        title: '➡️ View my pools / Join pool',
        prompt: 'Here is your pools!'
    },
    createPool: {
        title: '✏️ Create new pool',
        prompt: 'Please enter a name for a new pool'
    },
    leavePool: {
        title: '🚪 Leave curent pool',
        prompt: 'Leaving a pool...'
    },
    toMainMenu: {
        title: '⏪ Back to main menu',
        prompt: 'Here is main menu!'
    },
};

function myPoolsKeyboard(user, pool) {
    return Markup.keyboard([
        [
            myPoolsKbNames.viewJoinPools.title,
        ],
        [
            myPoolsKbNames.createPool.title,
            myPoolsKbNames.leavePool.title,
        ],
        [
            myPoolsKbNames.toMainMenu.title
        ],
    ]).resize().placeholder(getPlaceholder(user, pool));
}

module.exports = {
    myPoolsKbNames,
    myPoolsKeyboard,
};