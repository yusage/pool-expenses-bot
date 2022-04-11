const { menuItemNames, mainMenuKeyboard, } = require('../keyboards');

function createLeavePool(bot) {

    // handling 'Create new pool' button: init createPool scene
    bot.hears(menuItemNames.createPool.title, async ctx => {
        ctx.scene.enter('createPoolScene');
    });

    // handling 'Leave current pool' button: leaving current pool
    bot.hears(menuItemNames.leavePool.title, async ctx => {
        if (!ctx.user) {
            throw new Error('Cannot leave current pool: user not found');
        }
        if (!ctx.pool) {
            throw new Error('Cannot leave current pool: user not in a pool');
        }

        ctx.connector.leaveCurrentPool(ctx.user, ctx.pool);

        ctx.replyWithHTML(
            `🚪 Pool <b>"${ctx.pool.name}"</b> successfully left!`,
            mainMenuKeyboard()
        );
    });

}

module.exports = createLeavePool;