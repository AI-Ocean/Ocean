import axios from 'axios'
import https from 'https'
import store from '../store'

// const fs = require('fs')

import auth from './auth'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const kube = axios.create({
  baseURL: 'https://mlvc.khu.ac.kr:6443/api/v1/namespaces/ml-instance',
  timeout: 500,
  headers: {
    'Authorization': auth,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  httpsAgent: new https.Agent({ // ssl insecure
    rejectUnauthorized: false
  })
})

// utils
const getSelector = () => {
  if (store.state.claims && store.state.claims.level <= 0) {
    return {}
  }
  return {
    params: {
      labelSelector: 'user=' + store.userID
    }
  }
}

// instances
const getInstances = async () => {
  console.log('get instances')
  // get pods data
  const { data } = await kube.get('/pods', getSelector())
  var servicedata = await kube.get('/services', getSelector())
  servicedata = servicedata.data

  console.log(data)

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
    var nodePort = 0

    servicedata.items.forEach(service => {
      if (service.metadata.name === name) {
        nodePort = service.spec.ports[0].nodePort
      }
    })

    // pod data
    const podData = {
      name,
      labels,
      status: pod.status.phase,
      node_name: pod.spec.nodeName,
      limits,
      requests,
      volumes: pod.spec.volumes.filter(i => i.persistentVolumeClaim !== undefined), // filter only pvc
      nodePort
    }

    response.pods.push(podData)
  })
  return response
}

const createInstances = async (name, cpu, mem, gpu, claimName) => {
  // var name = req.body.name
  // var cpu = req.body.cpu_request
  // var memory = req.body.memory_request + 'Gi'
  // var gpu = req.body.gpu_request
  // var claimName = req.body.volume_name

  const memory = mem + 'Gi'

  const metadata = {
    name,
    labels: {
      app: name,
      user: store.userID
    }
  }

  const podData = {
    kind: 'Pod',
    apiVersion: 'v1',
    metadata,
    spec: {
      volumes: [
        {
          name: 'main-storage',
          persistentVolumeClaim: { claimName }
        },
        {
          name: 'dataset',
          persistentVolumeClaim: { claimName: 'dataset-pvc' }
        }
      ],
      containers: [
        {
          name,
          image: 'mlvclab/pytorch:1.4-cuda10.1-cudnn7-devel',
          imagePullPolicy: 'Always',
          resources: {
            limits: { memory, cpu, 'nvidia.com/gpu': gpu },
            requests: { memory: '1Gi', cpu: 1, 'nvidia.com/gpu': gpu }
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
    }
  }

  const serviceData = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata,
    spec: {
      type: 'NodePort',
      selector: { app: name },
      ports: [{
        port: 22,
        targetPort: 22,
        protocol: 'TCP',
        name: 'ssh'
      }]
    }
  }

  await kube.post('/pods', podData)
  await kube.post('/services', serviceData)
}

// Get specific pod
// app.get('/instances/:id', async (req, res) => {
//   var podname = req.params.id
//   const response = await kube.get('/pods/' + podname, getSelector(req.claims))
//   const pod = response.data

//   const limits = pod.spec.containers[0].resources.limits
//   const requests = pod.spec.containers[0].resources.requests
//   const { name, labels } = pod.metadata

//   var podData = {
//     name,
//     labels,
//     status: pod.status.phase,
//     node_name: pod.spec.nodeName,
//     limits,
//     requests,
//     volume: pod.spec.volumes.filter(i => i.persistentVolumeClaim !== undefined) // filter only pvc
//   }

//   res.send(podData)
// })

const api = {
  getInstances,
  createInstances
}

export default api
