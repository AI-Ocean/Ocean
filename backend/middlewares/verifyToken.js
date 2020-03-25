const admin = require('firebase-admin')

module.exports = (req, res, next) => {
  admin.auth().verifyIdToken(req.headers.authorization).then(decodedToken => {
    req.claims = decodedToken
    next()
  }).catch(e => {
    res.status(403).send(e)
  })
}
