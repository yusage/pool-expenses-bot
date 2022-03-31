const { Telegraf } = require('telegraf');
const setConnector = require('./connectors/setConnector');
const installPublicBotCommands = require('./telegraf/middleware/publicCommands');
const installHiddenBotCommands = require('./telegraf/middleware/hiddenCommand');

const botToken = '5150454115:AAFRQflmTa9Fsrtk58Zj-6KG9VAI2CAt4Mw';
const bot = new Telegraf(botToken);


async function main () {
    bot.use(await setConnector('mongoose'));
    installPublicBotCommands(bot);
    installHiddenBotCommands(bot);
    bot.launch();
}

// run program
main();

// share bot invite link with invite to a pool

// move some public bot commands to another file

// deploy project to Git and Heroku

// order records in plain list expense report