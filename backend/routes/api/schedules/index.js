const router = require('express').Router()
const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/', async (req, res) => {
  const r = {
    items: [],
    totalCount: 0
  }

  const { filter } = req.query

  let s
  if (filter == 'all') {
    s = await db.collection('schedules').orderBy('date').get()
  } else {
    s = await db.collection('schedules').where('date', '>=', [new Date().toISOString().substr(0, 10)]).orderBy('date').get()
  }

  r.totalCount = s.length
  s.forEach(v => {
    data = v.data()
    data.uid = v.id
    r.items.push(data)
  })
  res.send(r)
})

router.post('/', async (req, res) => {
  const t = await db.collection('schedules').add(req.body)
  res.send(t)
})

router.patch('/:uid', async (req, res) => {
  const { uid } = req.params
  const t = await db.collection('schedules').doc(uid).update(req.body)
  res.send(t)
})

router.delete('/:uid', async (req, res) => {
  const { uid } = req.params
  const t = await db.collection('schedules').doc(uid).delete()
  res.send(t)
})

module.exports = router
