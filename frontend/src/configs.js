const config = !window.FIREBASE_CONFIG ? process.env.VUE_APP_FIREBASE_CONFIG : window.FIREBASE_CONFIG
const firebaseConfig = eval('(' + config + ')')

module.exports = {
  FIREBASE_CONFIG: firebaseConfig
}
