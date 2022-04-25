const { Markup } = require('telegraf');
const { myPoolsKbNames } = require('./myPoolsKb');

const viewExpensesKbNames = {
    ExpensesByDate: {
        title: 'Expenses by date',
        prompt: 'Here is Expenses by date:'
    },
    ExpensesByUser: {
        title: 'Expenses by user',
        prompt: 'Here is Expenses by user:'
    },
    ExpensesPlainList: {
        title: 'Plain list of expenses',
        prompt: 'Here is Plain list of expenses:'
    },
    ExpensesToCSV: {
        title: 'Export to CSV',
        prompt: 'Exporting expenses to csv file...'
    },
};

const expenseReportsKeyboard = Markup.keyboard([
    [
        viewExpensesKbNames.ExpensesByDate.title,
        viewExpensesKbNames.ExpensesByUser.title
    ],
    [
        viewExpensesKbNames.ExpensesPlainList.title,
        viewExpensesKbNames.ExpensesToCSV.title
    ],
    [
        myPoolsKbNames.toMainMenu.title
    ],
]).resize();

module.exports = {
    viewExpensesKbNames,
    expenseReportsKeyboard,
};