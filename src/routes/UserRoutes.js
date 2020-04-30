const conn = require('../config/mysql.js')
const router = require('express').Router()

router.post('/register', (req, res) => {
    const {username, name, email, password} = req.body
    //Query insert data
    const sql = `INSERT INTO users(username, name, email, password) VALUES('${username}', '${name}', '${email}', '${password}')`

    //Running query
    conn.query(sql, (err, result) => {
        //Jika ada error kita akan kirim object errornya
        if(err) return res.send(err)

        //Jika berhasil, kirim object
        res.send({
            message: 'Register berhasil',
            result: result
        })
    })
})

module.exports = router