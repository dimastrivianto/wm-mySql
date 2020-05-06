const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()

const verifSendEmail = (name, email, userid) => {
    //CONFIG
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type :'OAuth2',
            user : 'dimtriv1990@gmail.com',
            clientId : process.env.CLIENT_ID,
            clientSecret : process.env.CLIENT_SECRET,
            refreshToken : process.env.REFRESH_TOKEN
        },
        // jika err: self signed certificate in certificate chain
        tls: {
            rejectUnauthorized: false
        }
    })

    //MAIL
    const mail = {
        from : 'dimtriv1990 <dimtriv1990@gmail.com',
        to: email,
        subject: 'Testing Nodemailer',
        html: `
            <h1>Halo, ${name}</h1>
            <h3><a href='http://localhost:2020/verify/${userid}'>Tekan Untuk Verifikasi</h3>
            `
    }

    //SEND EMAIL

    transporter.sendMail(mail, (err, result) => {
        if(err) return console.log({Errornya: err.message})

        console.log('Email terkirim')
    })
}

module.exports = verifSendEmail