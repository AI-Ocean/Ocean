var path = require('path')
var dotenv = require('dotenv')

console.log(process.env.NODE_ENV)

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.join(__dirname, '.env') })
}

module.exports = {
  KUBE_HOST: process.env.KUBE_HOST || "localhost",
  KUBE_PORT: process.env.KUBE_PORT || "6443",
  KUBE_TOKEN: process.env.KUBE_TOKEN,
  FIREBASE_CERT: JSON.parse(process.env.FIREBASE_CERT)
}
