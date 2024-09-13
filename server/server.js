const express = require('express')
const corns = require('cors')

const app = express()
app.use(corns())

app.get('/', (req, res) => {
    return res.json("from backend it is")
})

app.listen(3001, () => {
    console.log('listening to port 3001')
})