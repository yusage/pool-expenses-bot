const { adminToolsKbNames } = require('../telegraf/keyboards/adminToolsKb');
const { inlineKbNames } = require('../telegraf/keyboards/inlineKb');
const { mainMenuKbNames } = require('../telegraf/keyboards/mainMenuKb');
const { managePoolKbNames } = require('../telegraf/keyboards/managePoolKb');
const { myPoolsKbNames } = require('../telegraf/keyboards/myPoolsKb');
const { userSettingsKbNames } = require('../telegraf/keyboards/userSettingsKb');
const { viewExpensesKbNames } = require('../telegraf/keyboards/viewExpensesKb');

const menuItemNames = {
    ...adminToolsKbNames,
    ...inlineKbNames,
    ...mainMenuKbNames,
    ...managePoolKbNames,
    ...myPoolsKbNames,
    ...userSettingsKbNames,
    ...viewExpensesKbNames,
};

function textIsReserved(text) {
    if (text[0] === '/') return true;

    const reservedText = [];
    Object.keys(menuItemNames).forEach((item) => {
        if (menuItemNames[item].title) {
            reservedText.push(menuItemNames[item].title);
        }
    });
    if (reservedText.includes(text)) return true;

    return false;
}

module.exports = textIsReserved;