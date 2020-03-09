const app = require('express')()
require('express-async-errors')
const cors = require('cors')
const admin = require('firebase-admin')

const db = admin.firestore()
app.use(cors())

app.use(require('../middlewares/verifyToken'))

app.get('/', async (req, res) => {
  const r = await db.collection('users').doc(req.query.uid).get()
  res.send(r.data())
})

module.exports = app
