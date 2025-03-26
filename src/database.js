const { createPool } = require("mysql2/promise");
const { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } = require("./config.js");

const pool = createPool({
    host:DB_HOST,
    user:DB_USER,
    password:DB_PASSWORD,
    database:DB_DATABASE
});

module.exports = pool;