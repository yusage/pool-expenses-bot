const { Telegraf } = require('telegraf');
const express = require('express');
require('dotenv').config();
const setConnector = require('./connectors/setConnector');
const installPublicBotCommands = require('./telegraf/middleware/publicCommands');
const installHiddenBotCommands = require('./telegraf/middleware/hiddenCommand');

const port = process.env.PORT || 3000;
const expressApp = express();

const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);


async function main () {

    expressApp.get('/', (req, res) => {
        res.send('Hello World!');
    });
    expressApp.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });

    bot.use(await setConnector('mongoose'));
    installPublicBotCommands(bot);
    installHiddenBotCommands(bot);
    bot.launch();
}

// run program
main();

// change dbLink and telegram Token for non-local
// move some public bot commands to another file

// share bot invite link with invite to a pool

// deploy project to Heroku

// order records in plain list expense report