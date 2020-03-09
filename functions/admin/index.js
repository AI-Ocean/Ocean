const app = require('express')()
require('express-async-errors')
const cors = require('cors')
const admin = require('firebase-admin')

const db = admin.firestore()
app.use(cors())

app.use(require('../middlewares/verifyToken'))

app.get('/users', async (req, res) => {
  if (req.claims.level > 0) {
    return status(403).send({
      message: 'Permission Denyed.'
    })
  }

  let { offset, limits, order, sort } = req.query
  offset = Number(offset)
  limits = Number(limits)

  const r = {
    items: [],
    totalCount: 0
  }

  const t = await db.collection('infos').doc('users').get()
  r.totalCount = t.data().counter

  const s = await db.collection('users').orderBy(order, sort).offset(offset).limit(limits).get()

  s.forEach(v => r.items.push(v.data()))
  res.send(r)
})

app.use(require('../middlewares/error'))

module.exports = app
