const ctxAndStages = require('./_ctxAndStages');

const slashCommands = require('./_slashCommands');
const hiddenCommands = require('./_hiddenCommands');

const mainMenu = require('./mainMenu');
const myPools = require('./myPools');
const viewExpenses = require('./viewExpenses');
const userSettings = require('./userSettings');

const adminTools = require('./adminTools');
const managePool = require('./managePool');

const addNewExpense = require('./addNewExpense');


function installBotMiddleware(bot, db) {
    ctxAndStages(bot, db);

    slashCommands(bot);
    hiddenCommands(bot);

    mainMenu(bot);
    myPools(bot);
    viewExpenses(bot);
    userSettings(bot);

    managePool(bot);
    adminTools(bot);

    addNewExpense(bot);
}

module.exports = installBotMiddleware;