const firebaseConfig = eval('(' + process.env.VUE_APP_FIREBASE_CONFIG + ')')

module.exports = {
  FIREBASE_CONFIG: firebaseConfig
}
