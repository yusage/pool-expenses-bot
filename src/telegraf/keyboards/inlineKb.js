const { Markup } = require('telegraf');

const inlineKbNames = {
    switchPoolInline: {
        yTitle: 'Yes, switch pool',
        yAction: 'SWITCH_POOL',
        nTitle: 'No, stay in current pool',
        nAction: 'STAY_IN_POOL',
    },
    confirmExpenseLine: {
        yTitle: 'Confirm it',
        yAction: 'CONFIRM_EXPENSE',
        nTitle: 'Cancel it',
        nAction: 'CANCEL_EXPENSE',
    },
};

const switchPoolKeyboard = Markup.inlineKeyboard([
    Markup.button.callback(inlineKbNames.switchPoolInline.yTitle, inlineKbNames.switchPoolInline.yAction),
    Markup.button.callback(inlineKbNames.switchPoolInline.nTitle,inlineKbNames.switchPoolInline.nAction)
]);

function inlineConfirmExpense (expenseId) {
    return Markup.inlineKeyboard([
        Markup.button.callback(inlineKbNames.confirmExpenseLine.yTitle, `${inlineKbNames.confirmExpenseLine.yAction}_${expenseId}`),
        Markup.button.callback(inlineKbNames.confirmExpenseLine.nTitle, `${inlineKbNames.confirmExpenseLine.nAction}_${expenseId}`),
    ]).oneTime();
}

const removeKeyboard = Markup.removeKeyboard(true);

module.exports = {
    inlineKbNames,
    switchPoolKeyboard,
    inlineConfirmExpense,
    removeKeyboard,
};