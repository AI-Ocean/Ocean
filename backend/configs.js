var path = require('path')
var dotenv = require('dotenv')

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.join(__dirname, '.env') })
}

module.exports = {
  KUBE_HOST: process.env.KUBE_HOST.trim() || "localhost",
  KUBE_PORT: process.env.KUBE_PORT.trim() || "6443",
  KUBE_TOKEN: process.env.KUBE_TOKEN.trim(),
  FIREBASE_CERT: JSON.parse(process.env.FIREBASE_CERT)
}
