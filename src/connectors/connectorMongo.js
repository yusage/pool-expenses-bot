const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../mongo-models/user');
const Pool = require('../mongo-models/pool');
const Expense = require('../mongo-models/expense');

class ConnectorMongo {
    constructor (url) {
        this.url = url;
    }

    async init () {
        await mongoose.connect(this.url, {
            useNewUrlParser: true,
            // useCreateIndex: true,
            useUnifiedTopology: true,
            // useFindAndModify: true
        });
    }

    async startBotSession (teleUserId, userName, defaultNick, chatId) {
        const user = await User.findOne({ teleUserId });

        if (user && user.isActive && user.chatId === chatId) {
            return user;
        }
        if (user) {
            user.isActive = true;
            user.chatId = chatId;
            await user.save();
            return user;
        }

        const newUser = new User({
            teleUserId,
            name: userName,
            nick: defaultNick,
            chatId,
            isActive: true
        });
        await newUser.save();
        return newUser;
    }

    async stopCurrentBotSession (teleUserId) {
        const user = await User.findOne ({ teleUserId });
        if (!user || !user.isActive) {
            throw new Error('Cannot stop current bot session: no active session found');
        }

        user.isActive = false;
        await user.save();
        return user;
    }

    async checkIfPoolExists (poolName, owner) {
        const pool = await Pool.findOne( { name: poolName, ownerId: owner._Id } );
        if (!pool) {
            return false;
        }
        return true;
    }

    async findPoolById (poolId) {
        try {
            ObjectId(poolId);
        } catch (err) {
            throw new Error('Cannot find pool: invalid poolId');
        }

        const pool = await Pool.findById(poolId);
        if (!pool) {
            throw new Error('Cannot find pool: invalid poolId');
        }

        return pool;
    }

    async createPool (poolName, teleOwnerId) {
        const owner = await User.findOne ({ teleUserId: teleOwnerId});
        if (!owner) {
            throw new Error('Cannot create new pool: user not found');
        }

        const existingPool = await Pool.findOne( { name: poolName, ownerId: owner._Id } );
        // const isPoolExists = await this.checkIfPoolExists(poolName, owner);
        if (existingPool) {
            throw new Error('Cannot create new pool: pool name must be unique');
        }

        const pool = new Pool({
            name: poolName,
            ownerId: owner._id
        });
        pool.users.push({ userId: owner._id });
        await pool.save();
        return pool;
    }

    async joinPool (pool, user) {
        if (!user) {
            throw new Error('Cannot join pool: user not found');
        }

        if (!pool) {
            throw new Error('Cannot join pool: pool not found');
        }

        const alreadyInPool = pool.users.find((u => String(u.userId) === String(user._id)));
        if (!alreadyInPool) {
            pool.users = pool.users.concat({ userId: user._id });
            await pool.save();
        }
        user.currentPoolId = pool._id;
        user.save();

        return pool;
    }

    async leaveCurrentPool (user, pool) {
        user.currentPoolId = undefined;
        await user.save();

        return pool;
    }

    async removeUserFromPool (user, pool) {
        pool.users = pool.users.filter((u) => String(u.userId) !== String(user._id));
        await pool.save();

        if (user.currentPoolId === pool._id) {
            user.currentPoolId = undefined;
            await user.save();
        }

        return pool;
    }

    async addExpense (user, parsedExpenses) {
        if (!user || !user.isActive) {
            throw new Error('Cannot add expense: no active session found');
        }
        if (!user.currentPoolId) {
            throw new Error('Cannot add expense: you are not in pool now');
        }

        const expense = new Expense({
            ...parsedExpenses,
            userId: user._id,
            poolId: user.currentPoolId
        });
        expense.save();

        return expense;
    }

    async readUserPools (user) {
        const userPools = await Pool.find({ 'users.userId': user._id });
        return userPools;
    }

    async readAllPoolExpenses (pool) {
        await pool.populate({
            path: 'expenses',
            populate: {
                path: 'users'
            }
        });

        const output = [];
        pool.expenses.forEach((expense) => {
            output.push({
                date: expense.createdAt.toISOString().substring(0, 10),
                user: expense.users[0].nick,
                amount: expense.amount,
                currency: expense.currency,
                description: expense.description
            });
        });

        return output;
    }

    async changeNickname (user, nickname) {
        if (!user) {
            throw new Error('Cannot change nickname: user not defined');
        }

        if (!nickname) {
            throw new Error('Cannot change nickname: no nickname provided');
        }

        user.nick = nickname;
        await user.save();

        return user;
    }

    async getActivePoolUsers(pool) {
        await pool.populate({
            path: 'poolUsers'
        });

        const users = pool.poolUsers.filter((user) => {
            return (user.isActive && String(user.currentPoolId) === String(pool._id) && user.chatId);
        });

        return users;
    }
}

module.exports = ConnectorMongo;

