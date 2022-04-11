var http = require('http');

function keepHerokuActive (timeoutMinutes) {
    setInterval(function() {
        http.get('http://yusage-pool-expense-bot.herokuapp.com');
    }, 1000*60*timeoutMinutes);
}

module.exports = keepHerokuActive;