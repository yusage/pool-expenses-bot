const parseExpenseMessage = require('../../utils/parseExpenseMessage');
const textIsReserved = require('../../utils/textIsReserved');

const { inlineKbNames, inlineConfirmExpense, removeKeyboard } = require('../keyboards/inlineKb');
const composeExpenseLine = require('../../utils/composeExpenseLine');
const sendMessageToPool = require('../../utils/sendMessageToPool');

const Pool = require('../../mongo-models/pool');
const Expense = require('../../mongo-models/expense');

function addNewExpense(bot) {

    // handling expense messages: adding new expenses
    bot.on('text', async (ctx, next) => {
        if (textIsReserved(ctx.message.text)) return next();

        const parsedExpenses = await parseExpenseMessage(ctx.pool, ctx.message.text);
        if (!parsedExpenses) {
            throw new Error([
                'Cannot parse this message.',
                'The valid message format is: <amount> <currency> <description>',
                'For example: 100 uah coffee & croisant'
            ].join('\n'));
        }

        const expense = await ctx.db.addExpense({
            user: ctx.user,
            ...parsedExpenses,
        });
        const { currency: { currencyCode: currency }, amount, description } = expense;
        const pool = ctx.pool;
        const expenseLine = composeExpenseLine({ amount, currency, description });

        const sentMsg = await ctx.reply(
            `➕ you added: ${expenseLine}`,
            inlineConfirmExpense(String(expense._id))
        );

        setTimeout(async () => {
            const savedExpense = await ctx.db.readExpense(expense._id);

            if (savedExpense && savedExpense.status !== 'confirmed') {
                ctx.telegram.editMessageReplyMarkup(
                    sentMsg.chat.id,
                    sentMsg.message_id,
                    undefined,
                    removeKeyboard
                );

                sendMessageToPool({
                    ctx,
                    message: `➕ ${ctx.user.nick}: ${expenseLine}`,
                    pool,
                    userIdsExcluded: [ String(ctx.user._id) ],
                });
            }
        }, 15*1000);

        next();
    });

    // handling "Confirm" inline button
    bot.action(new RegExp(inlineKbNames.confirmExpenseLine.yAction + '_.*'), async ctx => {
        await ctx.answerCbQuery('');
        const expenseId = ctx.callbackQuery.data.substring('CONFIRM_EXPENSE_'.length);
        const expense = await ctx.db.confirmExpense(ctx.user, expenseId);
        await expense.populate('currency');

        const { currency: { currencyCode: currency }, amount, description } = expense;
        const expenseLine = composeExpenseLine({ amount, currency, description });

        ctx.telegram.editMessageReplyMarkup(
            ctx.chat.id,
            ctx.callbackQuery.message.message_id,
            undefined,
            removeKeyboard
        );

        sendMessageToPool({
            ctx,
            message: `➕ ${ctx.user.nick}: ${expenseLine}`,
            pool: await Pool.findById(expense.poolId),
            userIdsExcluded: [ String(ctx.user._id) ],
        });
    });

    // handling "Cancel" inline button
    bot.action(new RegExp(inlineKbNames.confirmExpenseLine.nAction + '_.*'), async ctx => {
        await ctx.answerCbQuery('');
        ctx.telegram.editMessageReplyMarkup(
            ctx.chat.id,
            ctx.callbackQuery.message.message_id,
            undefined,
            removeKeyboard
        );

        const expenseId = ctx.callbackQuery.data.substring('CANCEL_EXPENSE_'.length);
        const expense = await Expense.findById(expenseId);
        await expense.populate('currency');

        await expense.remove();

        const { currency: { currencyCode: currency }, amount, description } = expense;
        const expenseLine = composeExpenseLine({ amount, currency, description });
        ctx.replyWithHTML(`➖ you cancelled: <s>${expenseLine}</s>`);
    });
}

module.exports = addNewExpense;