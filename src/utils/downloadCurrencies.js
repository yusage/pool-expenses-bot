const https = require('https');

async function downloadCurrencies() {
    return new Promise((resolve, reject) => {

        const options = {
            host: 'api.exchangerate.host',
            port: 443,
            path: '/symbols',
        };

        let data = '';

        const request = https.get(options, function(res) {
            if (res.statusCode !== 200) {
                reject('Cannot fetch fx rates from web API');
            }

            res.on('data', (piece) => data += piece );

            res.on('end', () => {
                resolve(JSON.parse(data).symbols);
            });
        });

        request.on('error', (err) => reject(String(err)) );

        request.end();
    });
}

module.exports = downloadCurrencies;