const MongoDB = require('./MongoDB');

const setDb = async (dbType) => {
    let db = undefined;

    if (dbType === 'mongoose') {
        const url = process.env.MONGODB_URI;
        db = new MongoDB(url);
    } else return;

    await db.init();
    return db;
};

module.exports = setDb;