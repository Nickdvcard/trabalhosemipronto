const { createPool } = require('mysql2');

const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'PickNick007!',
    database: 'bancoapae6',
    connectionLimit: 10
});

module.exports = pool;