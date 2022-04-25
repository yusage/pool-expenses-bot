function getPlaceholder(user, pool) {
    if (pool) return `"${pool.name}": add expenses`;
    else return 'join some pool to start adding expenses';
}

module.exports = {
    getPlaceholder
};