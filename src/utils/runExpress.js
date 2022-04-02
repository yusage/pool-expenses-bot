const express = require('express');

const port = process.env.PORT;
const expressApp = express();

function runExpress () {
    expressApp.get('/', (req, res) => {
        res.send('Hello World!');
    });

    expressApp.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
}

module.exports = runExpress;