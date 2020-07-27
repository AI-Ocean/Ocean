var path = require('path')
var dotenv = require('dotenv')

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.join(__dirname, '.env') })
}

module.exports = {
  KUBE_API_URL: process.env.KUBE_API_URL.trim(),
  KUBE_CA: process.env.KUBE_CA.trim(),
  KUBE_TOKEN: process.env.KUBE_TOKEN.trim(),
  FIREBASE_CERT: JSON.parse(process.env.FIREBASE_CERT)
}
