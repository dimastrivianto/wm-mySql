const mysql = require('mysql')

const conn = mysql.createConnection({
    user: 'dimas',
    password: 'mysql123',
    host: 'localhost',
    database: 'bks_mysql',
    //ada nilai defaultnya (sehingga kalau tidak dikasih tidak apa-apa)
    port: 3306
})

module.exports = conn