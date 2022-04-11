const { menuItemNames, } = require('../keyboards');


function viewJoinPool(bot) {

    // handling 'View/Join pools' button: show list of user pools
    bot.hears(menuItemNames.viewJoinPools.title, async ctx => {
        const userPools = await ctx.connector.readUserPools (ctx.user);
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

    // handling /join_<pollId> message
    bot.hears(/\/join_.*/, async ctx => {
        ctx.scene.enter('joinPoolScene');
    });

    // handling /joinNewPool message
    bot.hears('/joinNewPool', async ctx => {
        ctx.scene.enter('joinNewPoolScene');
    });

}

module.exports = viewJoinPool;