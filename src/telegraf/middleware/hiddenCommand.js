const { mainMenuKeyboard } = require('../keyboards');

function installHiddenBotCommands (bot) {

    bot.command('joinPool', async ctx => {
        try {
            const msgParts = ctx.message.text.split(' ');
            if (msgParts.length != 2) {
                throw new Error('Cannot join pool: Incorrect arguments');
            }

            const poolId = msgParts[1];
            const pool = await ctx.connector.joinPool(poolId, ctx.user);
            if (!pool) {
                throw new Error('Cannot join pool: Something went wrong');
            }
            ctx.reply(`Pool "${pool.name}" successfully joined!`, mainMenuKeyboard(ctx.pool));
        } catch (err) {
            ctx.reply(String(err), mainMenuKeyboard(ctx.pool));
        }
    });

    bot.command('leaveCurrentPool', async ctx => {
        try {
            if (!ctx.user) {
                throw new Error('Cannot leave current pool: user not found');
            }
            if (!ctx.pool) {
                throw new Error('Cannot leave current pool: user not in a pool');
            }
            ctx.connector.leaveCurrentPool(ctx.user, ctx.pool);
            ctx.reply(`Pool ${ctx.pool.name} successfully left!`, mainMenuKeyboard(ctx.pool));
        } catch (err) {
            ctx.reply(String(err), mainMenuKeyboard());
        }
    });

    bot.command('addExpense', async ctx => {
        try {
            const expenseMessage = ctx.message.text.substring(12);
            const expense = await ctx.connector.addExpense(ctx.teleUserId, expenseMessage);
            ctx.reply(`Expense added: ${expense.amount} ${expense.currency}: ${expense.description}`);
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    bot.command('readAllPoolExpenses', async ctx => {
        const expenses = await ctx.connector.readAllPoolExpenses(ctx.pool);

        if (expenses.length === 0) {
            return ctx.reply(`There is no expenses in pool "${ctx.pool.name}`);
        }

        const output = [];
        output.push(`Here is expenses of "${ctx.pool.name}:\n`);
        expenses.forEach((expense) => {
            output.push(`${expense.message}: ${expense.amount} ${expense.currency} (${expense.description})`);
        });
        ctx.reply(output.join('\n'));
    });

}

module.exports = installHiddenBotCommands;