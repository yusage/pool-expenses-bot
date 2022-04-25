const path = require('path');
const { viewExpensesKbNames } = require('../keyboards/viewExpensesKb');
const composeExpenseLine = require('../../utils/composeExpenseLine');
const send = require('../../utils/send');
const saveToCSV = require('../../utils/saveToCSV');
const deleteFile = require('../../utils/deleteFile');

function viewExpenses(bot) {

    // handling 'Expenses by date' button: showing pool expenses by date
    bot.hears(viewExpensesKbNames.ExpensesByDate.title, async ctx => {
        const expenses = await ctx.db.readAllPoolExpenses(ctx.pool);

        if (expenses.length === 0) {
            return ctx.reply(`There is no expenses in pool "${ctx.pool.name}"`);
        }

        const dates = [...new (Set)(expenses.map((expense) => expense.date))];
        dates.sort();

        const outputObject = {'header': `🔎 <b>Expenses of "${ctx.pool.name}", by date:</b>\n\n`};
        const totals = [];
        let grandTotal = 0;

        dates.forEach((date) => {
            outputObject[date] = [`\n<b>${date}:</b> `];
            totals[date] = 0;
        });

        for (const expense of expenses) {
            outputObject[expense.date].push(`${expense.user}: ` + composeExpenseLine({
                ...expense,
                baseCurrency: ctx.pool.mainCurrency.symbol,
            }));
            totals[expense.date] += expense.baseAmount;
            grandTotal += expense.baseAmount;
        }

        outputObject['header'] += `<b>Total: ${grandTotal.toFixed(0)}${ctx.pool.mainCurrency.symbol}</b>`;
        dates.forEach((date) => {
            outputObject[date][0] += '<b>' + String(totals[date].toFixed(0)) + ctx.pool.mainCurrency.symbol + '</b>';
        });

        const output = [].concat(...Object.values(outputObject));
        await send(ctx, output.join('\n'));
    });

    // handling 'Expenses by user' button: showing pool expenses by user
    bot.hears(viewExpensesKbNames.ExpensesByUser.title, async ctx => {
        const expenses = await ctx.db.readAllPoolExpenses(ctx.pool);

        if (expenses.length === 0) {
            return ctx.reply(`There is no expenses in pool "${ctx.pool.name}"`);
        }

        const users = [...new Set(expenses.map((expense) => expense.user))];
        users.sort();

        const outputObject = {'header': `🔎 <b>Expenses of "${ctx.pool.name}", by user:</b>\n\n`};
        const totals = [];
        let grandTotal = 0;

        users.forEach((user) => {
            outputObject[user] = [`\n<b>${user}: </b>`];
            totals[user] = 0;
        });

        for (const expense of expenses) {
            outputObject[expense.user].push(`${expense.date}: ` +composeExpenseLine({
                ...expense,
                baseCurrency: ctx.pool.mainCurrency.symbol,
            }));
            totals[expense.user] += expense.baseAmount;
            grandTotal += expense.baseAmount;
        }

        outputObject['header'] += `<b>Total: ${grandTotal.toFixed(0)}${ctx.pool.mainCurrency.symbol}</b>`;
        users.forEach((user) => {
            outputObject[user][0] += '<b>' + String(totals[user].toFixed(0)) + ctx.pool.mainCurrency.symbol + '</b>';
        });

        const output = [].concat(...Object.values(outputObject));
        await send(ctx, output.join('\n'));
    });

    // handling 'Plain list of expenses' button: showing plain list of pool expenses
    bot.hears(viewExpensesKbNames.ExpensesPlainList.title, async ctx => {
        const expenses = await ctx.db.readAllPoolExpenses(ctx.pool);

        if (expenses.length === 0) {
            return ctx.reply(`There is no expenses in pool "${ctx.pool.name}"`);
        }

        const output = expenses.map((expense) => {
            return [
                `${expense.date}, ${expense.user}: `,
                composeExpenseLine({
                    ...expense,
                    baseCurrency: ctx.pool.mainCurrency.symbol,
                })
            ].join('');
        });

        let totalAmount = 0;
        for (const e of expenses) {
            totalAmount += e.baseAmount ? e.baseAmount : 0;
        }
        output.unshift(`<b>Total: ${totalAmount.toFixed(0)}${ctx.pool.mainCurrency.symbol}</b>`);
        output.unshift(`🔎 <b>Here is expenses for "${ctx.pool.name}":</b>\n`);
        await send(ctx, output.join('\n'));
    });

    // handling 'Export to CSV' button: export expenses to CSV, sending file
    bot.hears(viewExpensesKbNames.ExpensesToCSV.title, async ctx => {
        ctx.reply(viewExpensesKbNames.ExpensesToCSV.prompt);

        const expenses = await ctx.db.readAllPoolExpenses(ctx.pool);

        if (expenses.length === 0) {
            return ctx.reply(`There is no expenses in pool "${ctx.pool.name}"`);
        }

        const output = expenses.map((expense) => {
            return [
                expense.date,
                expense.user,
                expense.amount.toFixed(2).toString().replace(/\./, ','),
                expense.currencyCode,
                expense.description,
                expense.baseAmount.toFixed(2).toString().replace(/\./, ','),
                ctx.pool.mainCurrency.code,
                expense.rate.toFixed(4).toString().replace(/\./, ','),
            ];
        });
        output.unshift([
            'Date', 'User', 'Amount', 'Currency', 'Description',
            'Amount in base currency', 'Base currency', 'FX Rate',
        ]);

        const file = path.join(
            __dirname,
            '/../../../exportedFiles',
            `/${ctx.pool._id}_${Date.now()}.csv`
        );
        const isSaved = await saveToCSV(output, file);

        if (isSaved.result) {
            await ctx.reply('File successfully saved');
            await ctx.replyWithDocument({ source: file });
            deleteFile(file);
        }
        else await ctx.reply(`Error: ${isSaved.error.message}`);
    });
}

module.exports = viewExpenses;