const { Telegraf } = require('telegraf');

const setDb = require('./db/setDb');
const installBotMiddleware = require('./telegraf/middleware/_installBotMiddleware');
const keepHerokuActive = require('./utils/keepHerokuActive');
const initCurrencies = require('./utils/initCurrencies');

async function main () {
    if (!process.env.BOT_TOKEN) {
        return console.log('process.env.BOT_TOKEN is not defined');
    }

    const db = await setDb('mongoose');
    const botToken = process.env.BOT_TOKEN;

    const bot = new Telegraf(botToken);
    installBotMiddleware(bot, db);

    bot.launch();

    initCurrencies(db);
    if (!process.env.ENV) keepHerokuActive(20);
}

// run program
main();


// add app closing handling (ask Sasha)

// add "Join pool" request & confirmation by pool owner
// add expenses import to CSV
// order records in plain list expense report

// share bot invite link with invite to a pool