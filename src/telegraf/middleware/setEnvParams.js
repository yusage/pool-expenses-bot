const User = require('../../mongo-models/user');
const Pool = require('../../mongo-models/pool');

const setEnvParams = () => async (ctx, next) => {
    ctx.teleUserId = ctx.from.id;
    ctx.user = await User.findOne({ teleUserId: ctx.from.id });
    if (ctx.user) {
        ctx.pool = await Pool.findById(ctx.user.currentPoolId);
    } else ctx.pool = undefined;

    return next();
};

module.exports = setEnvParams;