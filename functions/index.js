const functions = require('firebase-functions')


exports.test = functions.https.onRequest(require('./test'))
exports.api = functions.https.onRequest(require('./api'))
