const conn = require('../config/mysql.js')
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const sharp = require('sharp')
const validator = require('validator')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')

const verifSendEmail = require('../config/verifSendEmail')

// CONFIG MULTER
const multer = require('multer')
const upload = multer({
    limits : {
        fileSize : 10000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File harus berupa jpg, jpeg, atau png'))
        }
        cb(null, true)
    }
})

//path untuk akses gambar
const filesDirectory = path.join(__dirname,'../files')

//Function Authentication
const auth = (req, res, next) => {
    //Mengambil token saat proses menerima request
    let token = req.header('Authorization')
    //Mencoba mengambil data asli yang tersimpan di dalam token
    let decoded = jwt.verify(token, 'nishishui')
    //Didalam token ada id user, selanjutnya di gunakan untuk mengambil data user di database
    let sql= `SELECT id, username, name, email, avatar FROM users WHERE id = ${decoded.id}`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err)
        //informasi user disimpan ke object 'req' di property 'user'
        //req.user = {id, username, name, email, avatar}
        req.user = result[0]
        //untuk melanjutkan ke proses berikutnya (proses utama)
        next()
    })
}

// UPLOAD AVATAR
router.post('/user/avatar', auth, upload.single('avatar'), async (req, res) => {
    //Menyimpan foto di folder (pakai username dari redux) ubah tipe di mysql-nya blob (binary large object)

    // untuk menghilangkan extension file
    // let extName = path.extname(fileName)
    // tidak bisa pakai pattern seperti ini karena bermasalah di urutan?????!!!!
    // const fileName = [req.body.username, `${req.body.username}-avatar`]

    //perintah sql bisa diluar atau didalam (optional)

    //dengan menggunakan double '?' 
    // const fileName = `${req.body.username}-avatar.png`
    // const sql = `UPDATE users SET avatar = ? WHERE username = ?`
    // const data = [fileName, req.body.username]
    try {
        const fileName = req.body.username
    
        await sharp(req.file.buffer).resize(200).png().toFile(`${filesDirectory}/${fileName}-avatar.png`)

        // Simpan nama fotonya di database
        const sql = `UPDATE users SET avatar = '${fileName}-avatar.png' WHERE username = ?`
        conn.query(sql, fileName, (err,result)=>{
            if(err) return res.send({error: err.sqlMessage})

            res.send('berhasil di simpan di DB dan folder')
        })
    } catch (error) {
        res.send(err.message)
    }
}, (err, req, res, next)=>{
    //Jika terdapat masalah terhadap multer, kita akan kirimkan error
    res.send(err)
})

// READ AVATAR
router.get('/user/avatar/:username', (req, res) => {
    const sql = `SELECT avatar FROM users WHERE username = ?`
    const username = req.params.username

    conn.query(sql, username, (err, result) => {
        if(err) return res.send(err.sqlMessage)

        //pakai try catch just in case ada orang pakai postman langsung nembak url dan mau merubah data
        try {
            res.sendFile(`${filesDirectory}/${result[0].avatar}`, (err) => {
                if(err) return res.send('Anda belum mengupload avatar')
            })
        } catch (error) {
            res.send('Username tidak ditemukan')
        }
    })
})

// DELETE AVATAR
//jika user mau delete account, gambar d api juga harus di delete!!!!!!!
router.patch('/user/avatar', (req, res)=>{
    const sql = `update users set avatar = null where username= ?`
    const data = req.body.username

    conn.query(sql, data, (err, result) =>{
        if(err) return res.send(err.sqlMessage)

        fs.unlink(`${filesDirectory}/${data}-avatar.png`, (err) => {
            if(err)return res.send('Something is wrong')

            res.send('the file has been removed')
        })
        
    })


})

//UPDATE USER
router.patch('/user/profile', auth, (req, res) => {
    res.send({
        message: 'Berikut isi req.user',
        user: req.user
    })
})


// REGISTER
router.post('/register', (req, res) => {
    // const {username, name, email, password} = req.body

    //Query insert data
    // const sql = `INSERT INTO users(username, name, email, password) VALUES('${username}', '${name}', '${email}', '${password}')`
    // ? escape query, seandainya data yang diinput bertambah, dia akan otomatis menambah sendiri
    // karena data ada di req.body, semua data di req.body akan dimasukkan
    const sql = `INSERT INTO users SET ?`
    const data = req.body

    //check format email
    //valid = true or false
    let valid = validator.isEmail(data.email)
    if(!valid) return res.send('Email tidak valid')

    //Hash password
    //cari tau salt!!!!
    data.password = bcrypt.hashSync(data.password, 8)
    //Running query
    conn.query(sql, data, (err, result) => {
        //Jika ada error kita akan kirim object errornya
        if(err) return res.send(err.sqlMessage)

        // kirim email verifikasi
        verifSendEmail(data.name, data.email, result.insertId)

        //Jika berhasil, kirim object
        res.send({
            message: 'Register berhasil',
            // result: result
        })
    })
})

//VERIFY EMAIL
router.get('/verify/:userid', (req, res) => {
    const sql = `UPDATE users SET verified = true WHERE id = ${req.params.userid}`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err.sqlMessage)
        // bisa pakai res.redirect
        res.send(`<h1>Verifikasi Berhasil</h1>`)
    })
})
// LOGIN
router.post('/user/login', (req, res)=>{
    // coba bikin bisa username dan email!!!!!
    const {username, password} =req.body

    const sql = `SELECT * FROM users WHERE username = '${username}'`
    const sql2 = `INSERT INTO tokens SET ? `

    conn.query(sql, (err, result) =>{
        if(err) return res.send(err)

        let user= result[0]
        //jika username tidak ditemukan
        if(!user) return res.send(`Username tidak ditemukan`)
        //validasi password, tidak bisa langsung pakai AND password = '${password}' langsung di const sql, karena password telah di hash
        let validPassword = bcrypt.compareSync(password, user.password)
        //jika pass tidak valid
        if(!validPassword) return res.send(`Password tidak valid`)
        //jika belum di verifikasi
        if(!user.verified) {
            return res.send({
                message: 'Silahkan verifikasi terlebih dahulu'
            })
        } 

        // Membuat token
        // { id: 23, iat: 1588737736 }
        let token = jwt.sign({id: user.id}, 'nishishui')
        const data = {user_id : user.id, token : token}

        conn.query(sql2, data, (err, result) => {
            if(err) return res.send(err)

            //Menghapus beberapa property hanya pada saat mau dikirim tidak di db
            delete user.password
            delete user.avatar
            delete user.verified

            res.send({
                message : `Login berhasil, selamat datang ${user.username}`,
                user,
                token
            })
        })     
    })
})

// READ ALL USER
router.get('/users', (req, res)=> {
    const sql = `SELECT * FROM users`

    conn.query(sql, (err, result)=> {
        if(err) return res.send(err)

        res.send({
            result
        })
    })
})

// DELETE USER BY ID
router.delete('/user/:id', (req, res)=> {
    let id = req.params.id

    const sql = `DELETE FROM users WHERE id = ${id} `

    conn.query(sql, (err, result) => {
        if(err) return res.send(err)

        res.send({
            message: `Data telah berhasil dihapus`,
            result : result
        })
    })
})



module.exports = router

