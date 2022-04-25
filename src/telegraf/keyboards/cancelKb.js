const { Markup } = require('telegraf');

const cancelKeyboard = Markup.keyboard([ 'Cancel' ] ).resize();

module.exports = {
    cancelKeyboard,
};