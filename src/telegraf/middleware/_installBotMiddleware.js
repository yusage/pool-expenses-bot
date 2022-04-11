const ctxAndStages = require('./ctxAndStages');
const startAndNavigation = require('./startAndNavigation');
const viewExpenses = require('./viewExpenses');
const viewJoinPool = require('./viewJoinPool');
const createLeavePool = require('./createLeavePool');
const addNewExpense = require('./addNewExpense');
const changeNickname = require('./changeNickname');
const hiddenCommands = require('./hiddenCommands');

function installBotMiddleware(bot) {
    ctxAndStages(bot);
    startAndNavigation(bot);
    viewExpenses(bot);
    viewJoinPool(bot);
    createLeavePool(bot);
    addNewExpense(bot);
    changeNickname(bot);
    hiddenCommands(bot);
}

module.exports = installBotMiddleware;