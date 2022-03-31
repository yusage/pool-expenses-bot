const setEnvParams = require('./setEnvParams');
const { session, Scenes: { Stage } } = require('telegraf');

const { menuItemNames,
    poolSetupKeyboard,
    mainMenuKeyboard,
    expenseReportsKeyboard
} = require('../keyboards');

const changeNicknameScene = require('../scenes/changeNickname');
const createPoolScene = require('../scenes/createPool');
const joinPoolScene = require('../scenes/joinPool');
const joinNewPoolScene = require('../scenes/joinNewPool');

const parseExpenseMessage = require('../../utils/parseExpenseMessage');

function installPublicBotCommands (bot) {

    // fill ctx attributes
    bot.use(setEnvParams());

    // stages initialization:
    const stage = new Stage([
        createPoolScene,
        joinPoolScene,
        joinNewPoolScene,
        changeNicknameScene
    ]);

    bot.use(session());
    bot.use(stage.middleware());

    // handling 'Start' command
    bot.command('start', async ctx => {
        try {
            const first_name = ctx.from.first_name;
            const last_name = ctx.from.last_name;
            let userName = '';
            let defaultNick = '';

            if (!first_name && !last_name) {
                userName = 'Anonymous';
                defaultNick = 'Anonymous';
            }

            if (first_name) {
                userName += first_name;
                defaultNick = first_name;
            }

            if (last_name) {
                if (first_name) {
                    userName += ' ' + last_name;
                    defaultNick += last_name.substring(0, 1);
                } else {
                    userName += last_name;
                    defaultNick += last_name;
                }
            }

            ctx.user = await ctx.connector.startBotSession(ctx.teleUserId, userName, defaultNick, ctx.chat.id);

            await ctx.replyWithHTML([
                '<b>Welcome to poolExpenses bot!</b>\n',
                `I will call you <b>${ctx.user.nick}</b>.`,
                'To change this nick, use /changeNickname'
            ].join('\n'), mainMenuKeyboard(ctx.pool));
        } catch (err) {
            console.log(String(err));
        }
    });

    // handling 'View pool expenses' button: switching to 'View expenses' menu
    bot.hears(menuItemNames.viewPoolExpenses.title, async ctx => {
        try {
            ctx.reply(menuItemNames.viewPoolExpenses.prompt, expenseReportsKeyboard);
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    // handling 'Plain list of expenses' button: showing plain list of pool expenses
    bot.hears(menuItemNames.ExpensesPlainList.title, async ctx => {
        try {
            const expenses = await ctx.connector.readAllPoolExpenses(ctx.pool);

            if (expenses.length === 0) {
                return ctx.reply(`There is no expenses in pool "${ctx.pool.name}"`);
            }

            const output = [];
            output.push(`🔎 <b>Here is expenses for "${ctx.pool.name}":</b>\n`);
            expenses.forEach((expense) => {
                output.push([
                    `${expense.date}, `,
                    `${expense.user}: `,
                    `${expense.amount} ${expense.currency}, `,
                    `${expense.description}`
                ].join(''));
            });
            ctx.replyWithHTML(output.join('\n'));
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    // handling 'Expenses by date' button: showing pool expenses by date
    bot.hears(menuItemNames.ExpensesByDate.title, async ctx => {
        try {
            const expenses = await ctx.connector.readAllPoolExpenses(ctx.pool);

            if (expenses.length === 0) {
                return ctx.reply(`There is no expenses in pool "${ctx.pool.name}"`);
            }

            const dates = [];
            expenses.forEach((expense) => {
                if (!dates.includes(expense.date)) dates.push(expense.date);
            });
            dates.sort();

            const output = [];
            output.push(`🔎 <b>Expenses of "${ctx.pool.name}", by date:</b>`);

            dates.forEach((date) => {
                output.push(`\n<b>${date}:</b>`);

                const dayExpenses = expenses.filter((expense) => {
                    return expense.date === date;
                });

                dayExpenses.forEach((expense) => {
                    output.push([
                        `${expense.user}: `,
                        `${expense.amount} ${expense.currency}, `,
                        `${expense.description}`
                    ].join(''));
                });
            });

            ctx.replyWithHTML(output.join('\n'));
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    // handling 'Expenses by user' button: showing pool expenses by user
    bot.hears(menuItemNames.ExpensesByUser.title, async ctx => {
        try {
            const expenses = await ctx.connector.readAllPoolExpenses(ctx.pool);

            if (expenses.length === 0) {
                return ctx.reply(`There is no expenses in pool "${ctx.pool.name}"`);
            }

            const users = [];
            expenses.forEach((expense) => {
                if (!users.includes(expense.user)) users.push(expense.user);
            });
            users.sort();

            const output = [];
            output.push(`🔎 <b>Expenses of "${ctx.pool.name}", by user:</b>`);

            users.forEach((user) => {
                output.push(`\n<b>${user}:</b>`);

                const dayExpenses = expenses.filter((expense) => {
                    return expense.user === user;
                });

                dayExpenses.forEach((expense) => {
                    output.push([
                        `${expense.date}: `,
                        `${expense.amount} ${expense.currency}, `,
                        `${expense.description}`
                    ].join(''));
                });
            });

            ctx.replyWithHTML(output.join('\n'));
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    // handling 'Pool setup' button: switching to 'Pool setup' menu
    bot.hears(menuItemNames.poolSetup.title, async (ctx, next) => {
        try {
            ctx.reply(menuItemNames.poolSetup.prompt, poolSetupKeyboard(ctx.pool));
        } catch (err) {
            ctx.reply(String(err));
        }
        next();
    });

    // handling 'View/Join pools' button: show list of user pools
    bot.hears(menuItemNames.viewJoinPools.title, async ctx => {
        try {
            const userPools = await ctx.connector.readUserPools (ctx.user);
            const output = [];
            if (!userPools) {
                output.push('➡️ <b>You have not any pool yet</b>\nUse link bellow to join a new one\n');
                output.push('<b>Join new pool</b>   /joinNewPool');
            } else {
                output.push('➡️ <b>Here is a list of your pools</b>\nUse link below to switch to a pool or join a new one\n');
                if (ctx.pool) {
                    output.push(`<b>${ctx.pool.name}</b> - your current pool\n`);
                }
                output.push('<b>Join new pool</b>   /joinNewPool\n');
                userPools.forEach((pool) => {
                    if ( !ctx.pool || String(pool._id) !== String(ctx.pool._id) ) {
                        output.push(`<b>${pool.name}</b>   /join_${String(pool._id)}`);
                        // output.push(`${pool.name} /join_${String(pool._id)}`);
                    }
                });
                ctx.replyWithHTML(output.join('\n'));
            }
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    // handling 'Create new pool' button: init createPool scene
    bot.hears(menuItemNames.createPool.title, async ctx => {
        try {
            ctx.scene.enter('createPoolScene');
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    // handling 'Leave current pool' button: leaving current pool
    bot.hears(menuItemNames.leavePool.title, async ctx => {
        try {
            if (!ctx.user) {
                throw new Error('Cannot leave current pool: user not found');
            }
            if (!ctx.pool) {
                throw new Error('Cannot leave current pool: user not in a pool');
            }
            ctx.connector.leaveCurrentPool(ctx.user, ctx.pool);
            ctx.replyWithHTML(`🚪 Pool <b>"${ctx.pool.name}"</b> successfully left!`, mainMenuKeyboard());
        } catch (err) {
            ctx.reply(String(err), poolSetupKeyboard(ctx.pool));
        }
    });

    // handling 'Back to main menu' button: swithing to main menu
    bot.hears(menuItemNames.toMainMenu.title, async ctx => {
        try {
            await ctx.reply(menuItemNames.toMainMenu.prompt, mainMenuKeyboard(ctx.pool));
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    // handling expense messages: adding new expenses
    bot.on('text', async (ctx, next) => {
        try {
            const expenseMessage = ctx.message.text;
            if (expenseMessage[0] === '/') return next();

            const reservedText = [];
            Object.keys(menuItemNames).forEach((item) => {
                if (menuItemNames[item].title) {
                    reservedText.push(menuItemNames[item].title);
                }
            });
            if (reservedText.includes(expenseMessage)) return next();

            const parsedExpenses = parseExpenseMessage(expenseMessage, '$');
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
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    // handling /join_<pollId> message
    bot.hears(/\/join_.*/, async ctx => {
        try {
            ctx.scene.enter('joinPoolScene');
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    // handling /joinNewPool message
    bot.hears('/joinNewPool', async ctx => {
        try {
            ctx.scene.enter('joinNewPoolScene');
        } catch (err) {
            ctx.reply(String(err));
        }
    });

    // handling /changeNickname message
    bot.hears('/changeNickname', async ctx => {
        try {
            ctx.scene.enter('changeNicknameScene');
        } catch (err) {
            ctx.reply(String(err));
        }
    });

}


module.exports = installPublicBotCommands;