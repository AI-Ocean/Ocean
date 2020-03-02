const app = require('express')()
const cors = require('cors')
const axios = require('axios')
const https = require('https')
const bodyParser = require('body-parser')
const fs = require('fs')
const yaml = require('js-yaml')

app.use(cors())

app.use(bodyParser.json())

// kube api endpoint
const kube = axios.create({
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

// TODO DELETE LATER
const url = 'https://mlvc.khu.ac.kr:6443/api/v1/namespaces/ml-instance'
const pvcurl = url + '/persistentvolumeclaims'
// TODO

// instances
app.get('/instances', async (req, res) => {
  // get pods data
  const { data } = await kube.get('/pods')

  // final response
  const response = {
    podNumber: data.items.length,
    pods: []
  }

  // get pod details
  data.items.forEach(pod => {
    const limits = pod.spec.containers[0].resources.limits
    const requests = pod.spec.containers[0].resources.requests
    const { name, labels } = pod.metadata

    // pod data
    const podData = {
      name,
      labels,
      status: pod.status.phase,
      node_name: pod.spec.nodeName,
      limits,
      requests,
      volumes: pod.spec.volumes.filter(i => i.persistentVolumeClaim !== undefined) // filter only pvc
    }

    response.pods.push(podData)
  })
  res.send(response)
})

// Create pod
app.post('/instances', async (req, res) => {
  console.log(req.body.name)
  var name = req.body.name
  var cpu = req.body.cpu_request
  var memory = req.body.memory_request + 'Gi'
  var gpu = req.body.gpu_request
  var claimName = req.body.volume_name

  const metadata = {
    labels: { app: name },
    name
  }

  const volumes = [
    {
      name: 'main-storage',
      persistentVolumeClaim: { claimName }
    },
    {
      name: 'dataset',
      persistentVolumeClaim: { claimName: 'dataset-pvc' }
    }
  ]
  const containers = [
    {
      name,
      image: 'mlvclab/pytorch:1.4-cuda10.1-cudnn7-devel',
      imagePullPolicy: 'Always',
      resources: { requests: { memory, cpu, 'nvidia.com/gpu': gpu },
        limits: { memory: '20Gi', cpu: 10, 'nvidia.com/gpu': 1 }
      },
      ports: [ { name: 'ssh', containerPort: 22 } ],
      volumeMounts: [
        {
          name: 'main-storage',
          mountPath: '/workspace'
        },
        {
          name: 'dataset',
          mountPath: '/dataset',
          readOnly: true
        }
      ]
    }
  ]

  const spec = {
    volumes,
    containers
  }

  const podData = {
    kind: 'Pod',
    apiVersion: 'v1',
    metadata,
    spec
  }

  const { data } = await kube.post('/pods', podData)
  res.send(data)
})

// Get specific pod
app.get('/instances/:id', async (req, res) => {
  var podname = req.params.id
  const response = await kube.get('/pods/' + podname)
  const pod = response.data

  const limits = pod.spec.containers[0].resources.limits
  const requests = pod.spec.containers[0].resources.requests
  const { name, labels } = pod.metadata

  var podData = {
    name,
    labels,
    status: pod.status.phase,
    node_name: pod.spec.nodeName,
    limits,
    requests,
    volume: pod.spec.volumes.filter(i => i.persistentVolumeClaim !== undefined) // filter only pvc
  }

  res.send(podData)
})

app.delete('/instances/:id', async (req, res) => {
  var podname = req.params.id
  const response = await kube.delete('/pods/' + podname)
  res.send(response.data)
})

// Get volumes
app.get('/volumes', async (req, res) => {
  const { data } = await kube.get('/persistentvolumeclaims')
  const response = {
    volumes: []
  }

  data.items.forEach(volume => {
    const name = volume.metadata.name
    const labels = volume.metadata.labels
    const capacity = volume.status.capacity.storage

    const volumeData = {
      name,
      labels,
      capacity
    }
    response.volumes.push(volumeData)
  })
  res.send(response)
})

// Create volume
app.post('/volumes', async (req, res) => {
  var name = req.body.name
  var storage = req.body.storage_request + 'Gi'

  const metadata = { name }
  const spec = {
    storageClassName: name,
    accessModes: [ 'ReadWriteOnce' ],
    resources: { requests: { storage } }
  }

  const volumeData = {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata,
    spec
  }

  const { data } = await kube.post('/persistentvolumeclaims', volumeData)
  res.send(data)
})

// Get specific volume
app.get('/volumes/:id', async (req, res) => {
  var volumename = req.params.id
  const response = await kube.get('/persistentvolumeclaims/' + volumename)
  const data = response.data

  const volume = {
    name: data.metadata.name,
    labels: data.metadata.labels,
    capacity: data.status.capacity.storage
  }

  res.send(volume)
})

// Delete volume
app.delete('/volumes/:id', async (req, res) => {
  var volumename = req.params.id
  const response = await kube.delete('/persistentvolumeclaims/' + volumename)
  res.send(response.data)
})

module.exports = app
