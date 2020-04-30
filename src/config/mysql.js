const mysql = require('mysql')

const conn = mysql.createConnection({
    user: 'dimas',
    password: 'mysql123',
    host: 'localhost',
    database: 'bks_mysql',
    port: 3306
})

module.exports = conn