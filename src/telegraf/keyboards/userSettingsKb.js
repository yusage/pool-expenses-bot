const { Markup } = require('telegraf');
const { myPoolsKbNames } = require('./myPoolsKb');

const userSettingsKbNames = {
    changeNickname: {
        title: '🔠 Change nickname',
        prompt: '🔠 Enter your new nickname'
    },
};

const userSettingsKeyboard = Markup.keyboard([
    [
        userSettingsKbNames.changeNickname.title,
    ],
    [
        myPoolsKbNames.toMainMenu.title,
    ],
]).resize();

module.exports = {
    userSettingsKbNames,
    userSettingsKeyboard,
};