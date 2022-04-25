const moment = require('moment');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const User = require('../mongo-models/user');
const Pool = require('../mongo-models/pool');
const Expense = require('../mongo-models/expense');
const Currency = require('../mongo-models/currency');
const Rate = require('../mongo-models/rate');
const PoolCurrency = require('../mongo-models/poolCurrency');

const downloadAndSaveFxRates = require('../utils/downloadAndSaveFxRates');

class MongoDB {
    constructor (url) {
        this.url = url;
    }

    async init () {
        await mongoose.connect(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
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

        await pool.populate('currencies');
        return pool;
    }

    async createPool (poolName, teleOwnerId, mainCurrencyId) {
        const owner = await User.findOne ({ teleUserId: teleOwnerId });
        if (!owner) {
            throw new Error('Cannot create new pool: user not found');
        }

        const existingPool = await Pool.findOne( { name: poolName, ownerId: owner._id } );
        if (existingPool) {
            throw new Error('Cannot create new pool: pool name must be unique');
        }

        const mainCurrency = await Currency.findById(mainCurrencyId);
        const pool = new Pool({
            name: poolName,
            ownerId: owner._id,
            users: [
                { userId: owner._id }
            ],
            mainCurrency: {
                '_id': mainCurrency._id,
                code: mainCurrency.currencyCode,
                symbol: mainCurrency.symbol,
            }
        });
        await pool.save();

        const defaultCurrencies = await this.readCurrencies({ defaultOnly: true });
        await this.addPoolCurrencies(pool, defaultCurrencies);

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

    async addExpense ({user, message, amount, currency, description } ) {
        if (!user || !user.isActive) {
            throw new Error('Cannot add expense: no active session found');
        }
        if (!user.currentPoolId) {
            throw new Error('Cannot add expense: you are not in pool now');
        }

        const expense = new Expense({
            message,
            userId: user._id,
            poolId: user.currentPoolId,
            amount,
            currency,
            description,
        });
        await expense.save();
        await expense.populate('currency');

        return expense;
    }

    async confirmExpense (user, expenseId) {
        const expense = await Expense.findById(expenseId);

        if (!expense) {
            throw new Error('Cannot confirm expense: expense not found');
        }
        if( String(expense.userId) !== String(user._id) ) {
            throw new Error('Cannot confirm expense: expense does not belong to user');
        }

        expense.status = 'confirmed';
        await expense.save();

        return expense;
    }

    async readExpense (expenseId) {
        const expense = await Expense.findById(expenseId);
        return expense;
    }

    async readUserPools (user) {
        const userPools = await Pool.find({ 'users.userId': user._id });
        return userPools;
    }

    async readAllPoolExpenses (pool) {
        await pool.populate({
            path: 'expenses',
            populate: { path: 'userId poolCurrencies' },
        });

        return pool.expenses.map((expense) => ({
            date: moment(expense.createdAt).format('YYYY.MM.DD'),
            user: expense.userId.nick,
            amount: expense.amount,
            currency: expense.poolCurrencies[0].symbol,
            currencyCode: expense.poolCurrencies[0].currencyCode,
            rate: expense.poolCurrencies[0].rate,
            baseAmount: expense.poolCurrencies[0].rate * expense.amount,
            description: expense.description,
        }));
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
            path: 'users.userId'
        });

        const users = pool.users.filter((user) => {
            return (user.userId.isActive && String(user.userId.currentPoolId) === String(pool._id) && user.userId.chatId);
        });

        return users.map((u)=> u.userId);
    }

    async createCurrency({ currencyCode, symbol, description, mask, isDefault, isActive }) {
        const currency = new Currency({
            currencyCode,
            symbol,
            description,
            mask,
            isDefault,
            isActive,
        });
        await currency.save();
        return currency;
    }

    async updateFxRate({ currencyFromId, currencyToId, rate, source }) {
        let fxRate = await Rate.findOne({ currencyFrom: currencyFromId, currencyTo: currencyToId });
        if (fxRate)
        {
            fxRate.rate = rate;
            fxRate.source = source;
        } else {
            fxRate = new Rate({
                currencyFrom: currencyFromId,
                currencyTo: currencyToId,
                rate,
                source,
            });
        }

        await fxRate.save();
        await fxRate.populate({ path: 'currencyTo', select: 'currencyCode' });
        await fxRate.populate({ path: 'currencyFrom', select: 'currencyCode' });
        return fxRate;
    }

    async readCurrencies({ defaultOnly, activeOnly, currencyCodes }) {
        const options = {};
        if (currencyCodes) options.currencyCode = { $in: currencyCodes };
        if (defaultOnly) options.isDefault = true;
        if (activeOnly) options.isActive = true;

        // console.log(options);
        const currencies = await Currency.find(options);
        return currencies;
    }

    async readFxRates({ currenciesFromId, currencyToId }) {
        const db = this;
        const currenciesFrom = await Currency.find({ _id: {$in: currenciesFromId} });
        const currencyTo = await Currency.findById(currencyToId);
        const existingRatesObj = await Rate.find({
            currencyFrom: { $in: currenciesFromId },
            currencyTo: currencyToId
        }).select('currencyFrom -_id');
        const existingRatesId = existingRatesObj.map(r => String(r.currencyFrom));

        for (const currency of currenciesFrom) {
            if ( !existingRatesId.includes(String(currency._id)) ) {
                await downloadAndSaveFxRates([currency, currencyTo], db);
            }
        }

        const rates = await Rate.find({
            currencyFrom: { $in: currenciesFromId },
            currencyTo: currencyToId
        });
        for (const r of rates) {
            await r.populate('currencyFrom');
            await r.populate('currencyTo');
        }

        return rates;
    }

    async addPoolCurrencies(pool, currenciesId) {
        const poolCurrencies = await PoolCurrency.find({ pool: pool._id });
        const poolCurrenciesId = poolCurrencies.map(c => String(c.currency));
        const NewCurrencies = await Currency.find({ _id: {$in: currenciesId} });

        let newCurrenciesId = [];
        for (const currency of NewCurrencies) {
            if ( !poolCurrenciesId.includes(String(currency._id)) )
            {
                newCurrenciesId.push(currency._id);
                if ( !currency.isActive ) {
                    currency.isActive = true;
                    await currency.save();
                }
            }
        }

        if (newCurrenciesId.length === 0) return;

        const rates = await this.readFxRates({
            currenciesFromId: newCurrenciesId,
            currencyToId: pool.mainCurrency._id,
        });

        const newRecords = rates.map((r) => {
            return {
                pool: pool._id,
                currency: r.currencyFrom._id,
                currencyCode: r.currencyFrom.currencyCode,
                symbol: r.currencyFrom.symbol,
                mask: r.currencyFrom.mask,
                rate: r.rate,
                source: r.source,
                setDate: r.updatedAt,
            };
        });

        return await PoolCurrency.insertMany(newRecords);
    }

    async readPoolCurrencies(pool, currenciesId) {
        const options = { pool: pool._id };
        if (currenciesId) options.currency = { $in: currenciesId };
        const poolCurrencies = await PoolCurrency.find(options);
        return poolCurrencies;
    }

    async updatePoolCurrencyRates(pool, mainCurrencyId = pool.mainCurrency._id) {
        const poolCurrencies = await this.readPoolCurrencies(pool);

        await Promise.all(poolCurrencies.map((c) => {
            this.readFxRates({
                currenciesFromId: [c.currency],
                currencyToId: mainCurrencyId,
            }).then((rate) => {
                c.rate = rate[0].rate;
                c.source = rate[0].source;
                c.setDate = rate[0].updatedAt;
                return c.save();
            });
        }));

        const rates = await this.readPoolCurrencies(pool);
        return rates;
    }

    async setMainPoolCurrency(poolObj, mainCurrency) {
        const pool = await Pool.findById(poolObj._id);

        pool.mainCurrency = {
            '_id': mainCurrency._id,
            code: mainCurrency.currencyCode,
            symbol: mainCurrency.symbol,
        };
        await pool.save();

        const rates = await this.updatePoolCurrencyRates(pool);

        return {
            mainCurrency,
            rates,
        };
    }

    async isPoolCurrencyRemovable(pool, currency) {
        const expenses = await Expense.find({ poolId: pool._id, currency: currency._id});
        if (expenses.length === 0) return true;
        else return false;
    }

    async removeCurrencyFromPool(pool, currency) {
        const deletedCurrencies = await PoolCurrency.deleteMany({
            pool: pool._id,
            currency: currency._id,
        });
        return deletedCurrencies.deletedCount;
    }

    async setPoolCurrencyRate(pool, currency, rate) {
        let rateRecord = await PoolCurrency.findOne({ pool, currency });
        if (rateRecord) {
            rateRecord.rate = rate;
            rateRecord.source = 'pool owner';
        } else rateRecord = {
            pool,
            currency,
            rate,
            source: 'pool owner',
            currencyCode: currency.currencyCode,
            symbol: currency.symbol,
            mask: currency.mask,
            setDate: Date.now(),
        };

        await rateRecord.save();
        return rateRecord;
    }

    setDefaultCurrencies(defaultCurrenciesCode) {
        return Currency.updateMany({
            currencyCode: { $in: defaultCurrenciesCode }
        }, {
            isDefault: true,
            isActive: true,
        }).then(() => Currency.find({ isDefault: true}));
    }

}



module.exports = MongoDB;

