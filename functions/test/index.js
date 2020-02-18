const app = require('express')()
const cors = require('cors')

app.use(cors())

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

module.exports = app
