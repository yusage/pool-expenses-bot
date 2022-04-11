const { menuItemNames, expenseReportsKeyboard } = require('../keyboards');

function viewExpenses(bot) {
    // handling 'View pool expenses' button: switching to 'View expenses' menu
    bot.hears(menuItemNames.viewPoolExpenses.title, async ctx => {
        ctx.reply(menuItemNames.viewPoolExpenses.prompt, expenseReportsKeyboard);
    });

    // handling 'Plain list of expenses' button: showing plain list of pool expenses
    bot.hears(menuItemNames.ExpensesPlainList.title, async ctx => {
        const expenses = await ctx.connector.readAllPoolExpenses(ctx.pool);

        if (expenses.length === 0) {
            return ctx.reply(`There is no expenses in pool "${ctx.pool.name}"`);
        }

        const output = expenses.map((expense) => {
            return `${expense.date}, ${expense.user}: ${expense.amount} ${expense.currency}, ${expense.description}`;
        });

        output.unshift(`🔎 <b>Here is expenses for "${ctx.pool.name}":</b>\n`);
        ctx.replyWithHTML(output.join('\n'));
    });

    // handling 'Expenses by date' button: showing pool expenses by date
    bot.hears(menuItemNames.ExpensesByDate.title, async ctx => {
        const expenses = await ctx.connector.readAllPoolExpenses(ctx.pool);

        if (expenses.length === 0) {
            return ctx.reply(`There is no expenses in pool "${ctx.pool.name}"`);
        }

        const dates = [...new Set(expenses.map((expense) => expense.date))];
        dates.sort();

        const outputObject = {'header': `🔎 <b>Expenses of "${ctx.pool.name}", by date:</b>`};
        dates.forEach((date) => {
            outputObject[date] = [`\n<b>${date}:</b>`];
        });

        for (const expense of expenses) {
            outputObject[expense.date].push([
                `${expense.user}: `,
                `${expense.amount} ${expense.currency}, `,
                `${expense.description}`
            ].join(''));
        }

        const output = [].concat(...Object.values(outputObject));
        ctx.replyWithHTML(output.join('\n'));
    });

    // handling 'Expenses by user' button: showing pool expenses by user
    bot.hears(menuItemNames.ExpensesByUser.title, async ctx => {
        const expenses = await ctx.connector.readAllPoolExpenses(ctx.pool);

        if (expenses.length === 0) {
            return ctx.reply(`There is no expenses in pool "${ctx.pool.name}"`);
        }

        const users = [...new Set(expenses.map((expense) => expense.user))];
        users.sort();

        const outputObject = {'header': `🔎 <b>Expenses of "${ctx.pool.name}", by user:</b>`};
        users.forEach((user) => {
            outputObject[user] = [`\n<b>${user}:</b>`];
        });

        for (const expense of expenses) {
            outputObject[expense.user].push([
                `${expense.date}: `,
                `${expense.amount} ${expense.currency}, `,
                `${expense.description}`
            ].join(''));
        }

        const output = [].concat(...Object.values(outputObject));

        ctx.replyWithHTML(output.join('\n'));
    });

}

module.exports = viewExpenses;