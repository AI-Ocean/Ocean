const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp({
  credential: admin.credential.cert(require('./key.json'))
})

const db = admin.firestore()

exports.api = functions.https.onRequest(require('./api'))

exports.admin = functions.https.onRequest(require('./admin'))

exports.profile = functions.https.onRequest(require('./profile'))

exports.createUser = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, emailVerified, photoURL, disabled } = user
  const cpus = 8
  const gpus = 2
  const mem = 32
  let level = 2

  // admin user
  if (functions.config().admin.email === user.email && user.emailVerified) {
    level = 0
  }
  // set custom claims
  await admin.auth().setCustomUserClaims(uid, { level: level })

  const d = {
    uid, email, displayName, emailVerified, photoURL, disabled, cpus, gpus, mem, level
  }
  const r = await db.collection('users').doc(uid).set(d)
  return r
})

exports.deleteUser = functions.auth.user().onDelete((user) => {
  return db.collection('users').doc(user.uid).delete()
})

exports.incrementUserCount = functions.firestore
  .document('users/{userId}')
  .onCreate(async (user) => {
    return db.collection('infos').doc('users').update(
      'counter', admin.firestore.FieldValue.increment(1)
    )
  })

exports.decrementUserCount = functions.firestore
  .document('users/{userId}')
  .onDelete(async (user) => {
    return db.collection('infos').doc('users').update(
      'counter', admin.firestore.FieldValue.increment(-1)
    )
  })

// if infos.users is not setted set to 0
db.collection('infos').doc('users').get().then(s => {
  if (!s.exists) db.collection('infos').doc('users').set({ counter: 0 })
})
