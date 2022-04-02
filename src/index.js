const { Telegraf } = require('telegraf');
require ('newrelic');

const runExpress = require('./utils/runExpress');
const setConnector = require('./connectors/setConnector');
const installPublicBotCommands = require('./telegraf/middleware/publicCommands');
const installHiddenBotCommands = require('./telegraf/middleware/hiddenCommand');

const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);


async function main () {
    runExpress();
    bot.use(await setConnector('mongoose'));
    installPublicBotCommands(bot);
    installHiddenBotCommands(bot);
    bot.launch();
}

// run program
main();

// move some public bot commands to another file

// add GSheets integration


// share bot invite link with invite to a pool

// how to hide telegram Token on gitHub in historical files
// order records in plain list expense report