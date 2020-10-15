var axios = require('axios')
var https = require('https')
var fs = require('fs')

var configs = require('../configs')


const timeout = 5000

const headers = {
  'Authorization': 'Bearer ' + configs.KUBE_TOKEN,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

const httpsAgent = new https.Agent({ // ssl
  ca: fs.readFileSync(configs.KUBE_CA)
})

// kube api endpoint
exports.kubeAPI = baseAPI = axios.create({
  baseURL: configs.KUBE_API_URL + '/api/v1/',
  timeout,
  headers,
  httpsAgent
})

// kube Job api endpoint
exports.kubeJobAPI = axios.create({
  baseURL: configs.KUBE_API_URL + '/apis/batch/v1/',
  timeout,
  headers,
  httpsAgent,
})

exports.getUserID = function (claims) {
  return claims.email.split('@')[0]
}

exports.getSelector = function (claims, app) {
  var params = {}
  if (app) {
    params['labelSelector'] = 'app=' + app
  }
  
  if (claims.level > 0) {
    params['labelSelector'] += ',user=' + claims.email.split('@')[0]
  }
  return { params }
}
