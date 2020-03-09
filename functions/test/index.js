const app = require('express')()
require('express-async-errors')
const cors = require('cors')

app.use(cors())

app.use(require('../middlewares/verifyToken'))

app.post('/', (req, res) => {
  res.send('post ok')
})

app.get('/', (req, res) => {
  res.send('get ok')
})

app.get('/:id', (req, res) => {
  res.send('get ok' + req.params.id)
})

app.put('/:id', (req, res) => {
  res.send('put ok ' + req.params.id)
})

app.delete('/:id', (req, res) => {
  res.send('delete ok ' + req.params.id)
})

app.use(require('../middlewares/error'))

module.exports = app
