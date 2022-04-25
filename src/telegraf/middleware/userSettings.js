const { userSettingsKbNames } = require('../keyboards/userSettingsKb');

function changeNickname(bot) {

    // handling /changeNickname message
    bot.hears('/changeNickname', async ctx => {
        ctx.scene.enter('changeNicknameScene');
    });

    // handling "Change Nickname" button
    bot.hears(userSettingsKbNames.changeNickname.title, async ctx => {
        ctx.scene.enter('changeNicknameScene');
    });

}

module.exports = changeNickname;