const { Markup } = require('telegraf');

const menuItemNames = {
    viewJoinPools: {
        title: '➡️ View my pools / Join pool',
        prompt: 'Here is your pools!'
    },
    createPool: {
        title: '✏️ Create new pool',
        prompt: 'Please enter a name for a new pool'
    },
    leaveBot: {
        title: '❌ Leave bot',
        prompt: 'Leaving the bot...'
    },
    viewPoolExpenses: {
        title: '🔎 View pool expenses',
        prompt: 'Here is pool expenses!'
    },
    poolSetup: {
        title: '☸ Pool setup',
        prompt: 'Here is pool setup options!'
    },
    leavePool: {
        title: '🚪 Leave curent pool',
        prompt: 'Leaving a pool...'
    },
    toMainMenu: {
        title: '⏪ Back to main menu',
        prompt: 'Here is main menu!'
    },
    changeNickname: {
        title: 'Change nickname',
        prompt: 'Enter your new nickname'
    },
    ExpensesPlainList: {
        title: 'Plain list of expenses',
        prompt: 'Here is Plain list of expenses:'
    },
    ExpensesByDate: {
        title: 'Expenses by date',
        prompt: 'Here is Expenses by date:'
    },
    ExpensesByUser: {
        title: 'Expenses by user',
        prompt: 'Here is Expenses by user:'
    },
    switchPoolInline: {
        yTitle: 'Yes, switch pool',
        yAction: 'SWITCH_POOL',
        nTitle: 'No, stay in current pool',
        nAction: 'STAY_IN_POOL',

    }
};

function getPlaceholder(pool) {
    let placeholder = '';
    if (pool) {
        placeholder = `add expenses to "${pool.name}"`;
    } else {
        placeholder = 'join some pool to start adding expenses';
    }
    return placeholder;
}

const replyMarkupNotInPool = Markup.keyboard([
    [ menuItemNames.viewJoinPools.title, menuItemNames.createPool.title]
]).resize().placeholder('join some pool to start adding expenses');

function replyMarkupInPool (pool) {
    return Markup.keyboard([
        [ menuItemNames.viewPoolExpenses.title, menuItemNames.poolSetup.title ],
    ]).resize().placeholder(getPlaceholder(pool));
}

function mainMenuKeyboard (pool) {
    if (pool) return replyMarkupInPool(pool);
    return replyMarkupNotInPool;
}

function poolSetupKeyboard (pool) {
    return Markup.keyboard([
        [ menuItemNames.viewJoinPools.title, menuItemNames.createPool.title, menuItemNames.leavePool.title ],
        [ menuItemNames.toMainMenu.title ]
    ]).resize().placeholder(getPlaceholder(pool));
}

const expenseReportsKeyboard = Markup.keyboard([
    [
        menuItemNames.ExpensesPlainList.title,
        menuItemNames.ExpensesByDate.title,
        menuItemNames.ExpensesByUser.title
    ],
    [
        menuItemNames.toMainMenu.title
    ]
]).resize();


const cancelKeyboard = Markup.keyboard([ 'Cancel' ] ).resize();

const switchPoolKeyboard = Markup.inlineKeyboard([
    Markup.button.callback(menuItemNames.switchPoolInline.yTitle, menuItemNames.switchPoolInline.yAction),
    Markup.button.callback(menuItemNames.switchPoolInline.nTitle,menuItemNames.switchPoolInline.nAction)
]);

module.exports = {
    menuItemNames,
    mainMenuKeyboard,
    poolSetupKeyboard,
    cancelKeyboard,
    switchPoolKeyboard,
    expenseReportsKeyboard
};