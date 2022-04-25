const moment = require('moment');
const { mainMenuKeyboard, mainMenuKbNames } = require('../keyboards/mainMenuKb');
const { adminKeyboard } = require('../keyboards/adminToolsKb');


function hiddenCommands (bot) {

    bot.command('joinPool', async ctx => {
        try {
            const msgParts = ctx.message.text.split(' ');
            if (msgParts.length != 2) {
                throw new Error('Cannot join pool: Incorrect arguments');
            }

            const poolId = msgParts[1];
            const pool = await ctx.db.joinPool(poolId, ctx.user);
            if (!pool) {
                throw new Error('Cannot join pool: Something went wrong');
            }
            ctx.reply(`Pool "${pool.name}" successfully joined!`, mainMenuKeyboard(ctx.user, ctx.pool));
        } catch (err) {
            ctx.reply(String(err), mainMenuKeyboard(ctx.user, ctx.pool));
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
            ctx.db.leaveCurrentPool(ctx.user, ctx.pool);
            ctx.reply(`Pool ${ctx.pool.name} successfully left!`, mainMenuKeyboard(ctx.user, ctx.pool));
        } catch (err) {
            ctx.reply(String(err), mainMenuKeyboard(ctx.user, ctx.pool));
        }
    });

    bot.command('addExpense', async ctx => {
        try {
            const expenseMessage = ctx.message.text.substring(12);
            const expense = await ctx.db.addExpense(ctx.teleUserId, expenseMessage);
            ctx.reply(`Expense added: ${expense.amount} ${expense.currency}: ${expense.description}`);
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    bot.command('admin', async (ctx) => {
        ctx.reply(mainMenuKbNames.adminTools.prompt, adminKeyboard);
    });

    bot.command('setDefCurrencies', async ctx => {
        const defaultCurrencies = await ctx.db.readCurrencies({ defaultOnly: true });
        const defaultCurrenciesId = defaultCurrencies.map(c => c._id);
        const defaultCurrenciesCode = defaultCurrencies.map(c => c.currencyCode);
        const currenciesAdded = await ctx.db.addPoolCurrencies(ctx.pool, defaultCurrenciesId);

        if (!currenciesAdded) {
            return ctx.reply(`${defaultCurrenciesCode} is already added to the pool`);
        }

        const output = ['Currencies added to pool:\n'];
        for (const c of currenciesAdded) {
            output.push(
                `<b>${c.currencyCode}:</b> rate=${c.rate.toFixed(4)} (source: ${c.source}, ` +
                `fx date: ${moment(c.setDate).format('DD.MM.YYYY')})`
            );
        }

        await ctx.replyWithHTML(output.join('\n'));
    });

}

module.exports = hiddenCommands;