var axios = require('axios')
var https = require('https')

// kube api endpoint
exports.kubeAPI = axios.create({
  baseURL: 'https://mlvc.khu.ac.kr:6443/api/v1/namespaces/ml-instance',
  timeout: 1000,
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjBKbVU5T0xnSjNITG9NTGxVbE0zNkVtOE05VEZmeWhiZFp6LTZCSFFfMncifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLWxuOXNmIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJmYmMwMWU0Mi1kZDQ3LTQ0YzItOTM4NC1mMWY5Zjk0MGQyMDIiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.L17i4pbXyIGZT0ZdBVLg5Rcq6gbohwov0Q-d1tt2uBgFD9V4cdWsx2ZQNtWNwOBXR58ViTK0I4Mnxe1xNGK1B-DasXQ6i3R018wNT5n-hXRy2_As8CXKXVWzOu2FQ2cvinQxVjN9nF8UY8s_3wf9gHl3zn7-YApUcS35nUhsfDCXb_ZFqVZRvqoCTPhfNkwWyM5N7SJ4wGTKKO6wO2xv5d8h81cA45kcjU-85Ua_nh8mXiFi7JwSJxshLjiuucB-oWBwQWfCWGRHj2hn3KhLViIvQBnOlcZoWvFK40l6WhTYKA7urWr_NUsTXa9jK0GiYkJB3ujT73c8gHQ4vJE93g',
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
      labelSelector: 'user=' + getUserID(claims)
    }
  }
}
