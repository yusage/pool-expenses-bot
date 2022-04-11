const { menuItemNames } = require('../telegraf/keyboards');

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