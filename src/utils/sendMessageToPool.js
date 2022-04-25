async function sendMessageToPool ( {ctx, message, pool, userIdsExcluded} ) {
    const activePoolUsers = await ctx.db.getActivePoolUsers(pool);

    activePoolUsers.forEach((user) => {
        if ( !userIdsExcluded.includes(String(user._id)) )
        {
            // console.log(user);
            console.log('!!!', user.chatId);
            ctx.telegram.sendMessage(user.chatId, message, { parse_mode: 'HTML' });
        }
    });
}

module.exports = sendMessageToPool;