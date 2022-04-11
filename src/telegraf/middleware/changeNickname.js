function changeNickname(bot) {

    // handling /changeNickname message
    bot.hears('/changeNickname', async ctx => {
        ctx.scene.enter('changeNicknameScene');
    });

}

module.exports = changeNickname;