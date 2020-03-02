const functions = require('firebase-functions');


exports.test = functions.https.onRequest(require('./test'))

exports.api = functions.https.onRequest(require('./api'))
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
