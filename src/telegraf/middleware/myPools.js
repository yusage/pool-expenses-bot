const { myPoolsKbNames } = require('../keyboards/myPoolsKb');
const { mainMenuKeyboard } = require('../keyboards/mainMenuKb');

function myPools(bot) {

    // handling 'View/Join pools' button: show list of user pools
    bot.hears(myPoolsKbNames.viewJoinPools.title, async ctx => {
        const userPools = await ctx.db.readUserPools (ctx.user);
        const output = [];

        if (!userPools) {
            output.push([
                '➡️ <b>You have not any pool yet</b>',
                'Use link bellow to join a new one',
                '<b>Join new pool</b>   /joinNewPool'
            ].join('\n'));
            return ctx.replyWithHTML(output.join('\n'));
        }

        output.push([
            '➡️ <b>Here is a list of your pools</b>',
            'Use link below to switch to a pool or join a new one\n'
        ].join('\n'));

        if (ctx.pool) {
            output.push(`<b>${ctx.pool.name}</b> - your current pool\n`);
        }
        output.push('<b>Join new pool</b>   /joinNewPool\n');

        userPools.forEach((pool) => {
            if ( !ctx.pool || String(pool._id) !== String(ctx.pool._id) ) {
                output.push(`<b>${pool.name}</b>   /join_${String(pool._id)}`);
            }
        });

        ctx.replyWithHTML(output.join('\n'));
    });

    // handling 'Create new pool' button: init createPool scene
    bot.hears(myPoolsKbNames.createPool.title, async ctx => {
        ctx.scene.enter('createPoolScene');
    });

    // handling 'Leave current pool' button: leaving current pool
    bot.hears(myPoolsKbNames.leavePool.title, async ctx => {
        if (!ctx.user) {
            throw new Error('Cannot leave current pool: user not found');
        }
        if (!ctx.pool) {
            throw new Error('Cannot leave current pool: user not in a pool');
        }

        ctx.db.leaveCurrentPool(ctx.user, ctx.pool);

        ctx.replyWithHTML(
            `🚪 Pool <b>"${ctx.pool.name}"</b> successfully left!`,
            await mainMenuKeyboard(ctx.user, ctx.pool)
        );
    });

    // handling 'Back to main menu' button: swithing to main menu
    bot.hears(myPoolsKbNames.toMainMenu.title, async ctx => {
        await ctx.reply(myPoolsKbNames.toMainMenu.prompt, mainMenuKeyboard(ctx.user, ctx.pool));
    });

}

module.exports = myPools;