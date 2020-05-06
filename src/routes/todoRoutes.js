const conn = require('../config/mysql.js')
const router = require('express').Router()

//CREATE todo
router.post('/user/todo', (req, res) => {
    // let user_id = req.body.user_id
    // let description = req.body.description
    // const sql = `INSERT INTO todos(user_id, description) VALUES(${user_id}, '${description}')`
    const sql = `INSERT INTO todos SET ?`
    //kalau mau memakai pola seperti ini nama property harus sama dengan nama column di DB
    const data = req.body

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err.sqlMessage)

        res.send({
            message: `Todo berhasil ditambahkan`,
            id: result.insertId
        })
    })
})

// READ ALL TODOS
router.get('/todos', (req, res) => {
    const sql = `SELECT * FROM todos`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err.sqlMessage)

        res.send({
            result
        })
    })
})
// READ TODOS By ID
router.get('/todos/:user_id', (req,res)=> {
    const sql = `SELECT * FROM todos WHERE user_id = ?`
    const data = req.params.user_id

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err.sqlMessage)

        res.send({
            result
        })
    })
})

//UPDATE TODO
router.patch('/user/todo/:todoid', (req, res) => {
    const sql = `UPDATE todos SET ? WHERE id = ?`
    // Jika menggunakan tanda tanya (escape query) lebih dari satu, variable 'data' harus berupa array
    // Dimana array tersebut berisi data yang akan me-replace tanda tanya yang ada. urutan itu diperhitungkan
    const data = [req.body, req.params.todoid]

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err.sqlMessage)

        res.send({
            message : "Todo berhasil di update"
        })
    })
})

//DELETE TODOS
router.delete('/todos/:todoid', (req, res) => {
    const sql = `DELETE FROM todos WHERE id = ?`
    const data = req.params.todoid 

    conn.query(sql, data, (err, result) => {
        if(err)return res.send(err.sqlMessage)

        res.send({
            message: "Todo berhasil di hapus"
        })
    })
})



module.exports = router