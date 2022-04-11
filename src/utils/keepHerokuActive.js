const http = require('http');
const express = require('express');

function keepHerokuActive (timeoutMinutes) {
    setInterval(function() {
        http.get('http://yusage-pool-expense-bot.herokuapp.com');
    }, 1000*60*timeoutMinutes);

    const app = express();
    const port = process.env.PORT;
    app.listen(port, () => {
        console.log('Listening to port ' + port);
    });
}

module.exports = keepHerokuActive;