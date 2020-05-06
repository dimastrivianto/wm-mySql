const jwt = require('jsonwebtoken')

let basicJwt = () => {
    let token = jwt.sign({ id: 23}, 'nishishui')
    console.log(token)
    
    let decoded = jwt.verify(token, 'nishishui')
    console.log(decoded)

    let tokenCreated = new Date(decoded.iat * 1000)
    console.log(`${tokenCreated.getHours()} : ${tokenCreated.getMinutes()}`)
}

basicJwt()