function composeUserName (firstName, lastName) {
    let userName = '';
    let defaultNick = '';

    if (!firstName && !lastName) {
        userName = 'Anonymous';
        defaultNick = 'Anonymous';
    }

    if (firstName) {
        userName += firstName;
        defaultNick = firstName;
    }

    if (lastName) {
        if (firstName) {
            userName += ' ' + lastName;
            defaultNick += lastName.substring(0, 1);
        } else {
            userName += lastName;
            defaultNick += lastName;
        }
    }

    return {
        userName,
        defaultNick
    };
}

module.exports = composeUserName;