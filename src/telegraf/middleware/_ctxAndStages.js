const { session, Scenes: { Stage } } = require('telegraf');

const User = require('../../mongo-models/user');
const Pool = require('../../mongo-models/pool');

const changeNicknameScene = require('../scenes/changeNickname');
const { createPoolScene, mainPoolCurrencyScene } = require('../scenes/createPool');
const addCurrencyToPoolScene = require('../scenes/addCurrencyToPool');
const removeCurrencyFromPoolScene = require('../scenes/removeCurrencyFromPool');
const joinPoolScene = require('../scenes/joinPool');
const joinNewPoolScene = require('../scenes/joinNewPool');
const changeMainCurrencyScene = require('../scenes/changeMainCurrency');
const createBotCurrencyScene = require('../scenes/createBotCurrency');
const addFxRateScene = require('../scenes/addFxRate');
const { setFxPoolRateScene, setFxPoolRate2Scene } = require('../scenes/setFxPoolRate');

// stages initialization:
const stage = new Stage([
    createPoolScene,
    mainPoolCurrencyScene,
    joinPoolScene,
    joinNewPoolScene,
    changeNicknameScene,
    changeMainCurrencyScene,
    createBotCurrencyScene,
    addFxRateScene,
    addCurrencyToPoolScene,
    removeCurrencyFromPoolScene,
    setFxPoolRateScene,
    setFxPoolRate2Scene,
]);

function ctxAndStages(bot, db) {

    // errors handling
    // bot.catch((err, ctx) => {
    //     ctx.reply('⚠️ ' + String(err));
    // });

    // fill ctx attributes
    bot.use(async (ctx, next) => {
        ctx.db = db;
        ctx.teleUserId = ctx.from.id;
        ctx.user = await User.findOne({ teleUserId: ctx.from.id });
        if (ctx.user) {
            ctx.pool = await Pool.findById(ctx.user.currentPoolId);
        } else ctx.pool = undefined;
        return next();
    });

    // use sessions, activate stages
    bot.use(session());
    bot.use(stage.middleware());

}

module.exports = ctxAndStages;