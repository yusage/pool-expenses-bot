class ConnectorSheets {
    constructor (url) {
        this.url = url;
    }
    async init () {

    }
    async createPool (poolName, owner) {
        return poolName === owner;
    }
}

module.exports = ConnectorSheets;

