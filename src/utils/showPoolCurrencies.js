const composePoolCurrenciesMsg = require('./composePoolCurrenciesMsg');

async function showPoolCurrencies(ctx, pool) {
    const currencies = await ctx.db.readPoolCurrencies(pool);
    if (!currencies) {
        return await ctx.reply(`There is no currencies assigned to a pool "${pool.name}"`);
    }
    const output = composePoolCurrenciesMsg(currencies);
    output.unshift(
        'Pool currencies & rates:\n\n' +
        `Main pool currency: <b>${pool.mainCurrency.code}</b>`
    );
    await ctx.replyWithHTML(output.join('\n'));
}

module.exports = showPoolCurrencies;