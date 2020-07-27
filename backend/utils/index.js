var axios = require('axios')
var https = require('https')

var configs = require('../configs')

// kube api endpoint
exports.kubeAPI = axios.create({
  baseURL: configs.KUBE_API_URL + '/api/v1/',
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer ' + configs.KUBE_TOKEN,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  httpsAgent: new https.Agent({ // ssl
    // rejectUnauthorized: false
    ca: configs.KUBE_CA
  })
})

exports.kubeJobAPI = axios.create({
  baseURL: configs.KUBE_API_URL + '/apis/batch/v1/',
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer ' + configs.KUBE_TOKEN,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  httpsAgent: new https.Agent({ // ssl
    // rejectUnauthorized: false
    ca: configs.KUBE_CA
  })
})

exports.getUserID = function (claims) {
  return claims.email.split('@')[0]
}

exports.getSelector = function (claims) {
  if (claims.level <= 0) return {}
  return {
    params: {
      labelSelector: 'user=' + claims.email.split('@')[0]
    }
  }
}
