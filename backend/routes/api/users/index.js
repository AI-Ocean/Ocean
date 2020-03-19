const router = require('express').Router()
const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/', async (req, res) => {
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

router.get('/:uid', async (req, res) => {
  const r = await db.collection('users').doc(req.params.uid).get()
  res.send(r.data())
})

router.patch('/:uid', async (req, res) => {
  const { uid } = req.params
  const { level } = req.body
  if (level) await admin.auth().setCustomUserClaims(uid, { level: level })
  const t = await db.collection('users').doc(uid).update(req.body)
  res.send(t)
})

module.exports = router
