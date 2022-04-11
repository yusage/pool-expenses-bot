const { session, Scenes: { Stage } } = require('telegraf');

const User = require('../../mongo-models/user');
const Pool = require('../../mongo-models/pool');

const changeNicknameScene = require('../scenes/changeNickname');
const createPoolScene = require('../scenes/createPool');
const joinPoolScene = require('../scenes/joinPool');
const joinNewPoolScene = require('../scenes/joinNewPool');

// stages initialization:
const stage = new Stage([
    createPoolScene,
    joinPoolScene,
    joinNewPoolScene,
    changeNicknameScene
]);

function ctxAndStages(bot) {

    // errors handling
    bot.catch((err, ctx) => {
        ctx.reply('⚠️ ' + String(err));
    });

    // fill ctx attributes
    bot.use(async (ctx, next) => {
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