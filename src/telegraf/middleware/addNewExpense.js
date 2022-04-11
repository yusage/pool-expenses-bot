const parseExpenseMessage = require('../../utils/parseExpenseMessage');
const textIsReserved = require('../../utils/textIsReserved');

function addNewExpense(bot) {

    // handling expense messages: adding new expenses
    bot.on('text', async (ctx, next) => {
        if (textIsReserved(ctx.message.text)) return next();

        const parsedExpenses = parseExpenseMessage(ctx.message.text, '$');
        if (!parsedExpenses) {
            throw new Error([
                'Cannot parse this message.',
                'The valid message format is: <amount> <currency> <description>',
                'For example: 100 uah coffee & croisant'
            ].join('\n'));
        }

        const expense = await ctx.connector.addExpense(ctx.user, parsedExpenses);
        const activePoolUsers = await ctx.connector.getActivePoolUsers(ctx.pool);

        activePoolUsers.forEach((user) => {
            ctx.telegram.sendMessage(user.chatId, [
                `➕ ${ctx.user.nick}: `,
                `${expense.amount} `,
                `${expense.currency}, `,
                `${expense.description}`
            ].join(''));
        });

        next();
    });


}

module.exports = addNewExpense;