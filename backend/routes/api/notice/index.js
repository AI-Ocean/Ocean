const router = require('express').Router()
const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/', async (req, res) => {
  const r = {
    items: [],
    totalCount: 0
  }

  const s = await db.collection('notice').orderBy('date').get()
  r.totalCount = s.length
  s.forEach(v => {
    r.items.push(v.data())
  })
  res.send(r)
})

module.exports = router
