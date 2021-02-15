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

function getUserID(user) {
  return user.email.split('@')[0]
}

exports.getUserID = getUserID

exports.getSelector = function (user, app) {
  var params = {}
  if (app) {
    params['labelSelector'] = 'app=' + app
  }
  
  if (user.role !== 'admin') {
    params['labelSelector'] += ',user=' + getUserID(user)
  }
  return { params }
}
