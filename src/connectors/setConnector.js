const ConnectorMongo = require('./connectorMongo');
const ConnectorSheets = require('./connectorSheets');

const setConnector = async (dbType) => {
    let connector = undefined;

    if (dbType === 'mongoose') {
        const url = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pool-expenses-chatbot-api';
        connector = new ConnectorMongo(url);
    } else if (dbType === 'sheets') {
        connector = new ConnectorSheets();
    }

    await connector.init();

    return async (ctx, next) => {
        ctx.connector = connector;
        next();
    };
};

module.exports = setConnector;