const ConnectorMongo = require('./connectorMongo');
const ConnectorSheets = require('./connectorSheets');

const setConnector = async (dbType) => {
    let connector = undefined;

    if (dbType === 'mongoose') {
        const url = process.env.MONGODB_URI;
        connector = new ConnectorMongo(url);
    } else if (dbType === 'sheets') {
        connector = new ConnectorSheets();
    } else return;

    await connector.init();

    return (ctx, next) => {
        ctx.connector = connector;
        return next();
    };
};

module.exports = setConnector;