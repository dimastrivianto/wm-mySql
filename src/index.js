const express = require('express')
const app = express()
const port = 2020

// Routes
const userRouter = require('./routes/UserRoutes')

app.use(express.json())
app.use(userRouter)

app.get('/', (req, res) => {
    res.send(`<h1>API Running at ${port}</h1>`)
})

app.listen(port, () => console.log(`API Running at ${port}`))