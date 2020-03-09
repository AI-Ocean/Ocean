const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp({
  credential: admin.credential.cert(require('./key.json'))
})

const db = admin.firestore()

exports.test = functions.https.onRequest(require('./test'))

exports.api = functions.https.onRequest(require('./api'))

exports.admin = functions.https.onRequest(require('./admin'))

exports.profile = functions.https.onRequest(require('./profile'))

exports.createUser = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, emailVerified, photoURL, disabled } = user
  const cpus = 8
  const gpus = 2
  const mem = 32

  // 일반 사용자의 클레임
  let customClaims = {
    level: 2
  }
  // Admin일 경우 처리
  if (functions.config().admin.email === user.email && user.emailVerified) {
    customClaims.level = 0
  }
  // 커스텀 클레임 등록
  await admin.auth().setCustomUserClaims(uid, customClaims).then(() => {
  })

  const d = {
    uid, email, displayName, emailVerified, photoURL, disabled, cpus, gpus, mem
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

// infos users에 데이터가 없으면 0으로 초기화
db.collection('infos').doc('users').get().then(s => {
  if (!s.exists) db.collection('infos').doc('users').set({ counter: 0 })
})
