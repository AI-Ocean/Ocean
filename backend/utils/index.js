var axios = require('axios')
var https = require('https')

var configs = require('../config')

// kube api endpoint
exports.kubeAPI = axios.create({
  baseURL: 'https://' + configs.kube_host + ':' + configs.kube_port + '/api/v1/',
  timeout: 5000,
  headers: {
    'Authorization': configs.kube_token,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  httpsAgent: new https.Agent({ // ssl insecure
    rejectUnauthorized: false
  })
})

exports.kubeJobAPI = axios.create({
  baseURL: 'https://' + configs.kube_host + ':' + configs.kube_port + '/apis/batch/v1/',
  timeout: 5000,
  headers: {
    'Authorization': configs.kube_token,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  httpsAgent: new https.Agent({ // ssl insecure
    rejectUnauthorized: false
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
