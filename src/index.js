const { Telegraf } = require('telegraf');

const setConnector = require('./connectors/setConnector');
const installBotMiddleware = require('./telegraf/middleware/_installBotMiddleware');
const keepHerokuActive = require('./utils/keepHerokuActive');


async function main () {
    if (!process.env.BOT_TOKEN) {
        return console.log('process.env.BOT_TOKEN is not defined');
    }

    const botToken = process.env.BOT_TOKEN;
    const bot = new Telegraf(botToken);

    bot.use(await setConnector('mongoose'));

    installBotMiddleware(bot);

    bot.launch();
    keepHerokuActive(20);
}

// run program
main();


// add app closing handling (ask Sasha)

// add "Join pool" request & confirmation by pool owner
// add GSheets integration
// order records in plain list expense report

// share bot invite link with invite to a pool

// how to hide telegram Token on gitHub in historical files