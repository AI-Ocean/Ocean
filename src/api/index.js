import axios from 'axios'
import https from 'https'
import store from '../store'

const kube = axios.create({
  baseURL: 'https://mlvc.khu.ac.kr:6443/api/v1/namespaces/ml-instance',
  timeout: 1000,
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjBKbVU5T0xnSjNITG9NTGxVbE0zNkVtOE05VEZmeWhiZFp6LTZCSFFfMncifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLWxuOXNmIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJmYmMwMWU0Mi1kZDQ3LTQ0YzItOTM4NC1mMWY5Zjk0MGQyMDIiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.L17i4pbXyIGZT0ZdBVLg5Rcq6gbohwov0Q-d1tt2uBgFD9V4cdWsx2ZQNtWNwOBXR58ViTK0I4Mnxe1xNGK1B-DasXQ6i3R018wNT5n-hXRy2_As8CXKXVWzOu2FQ2cvinQxVjN9nF8UY8s_3wf9gHl3zn7-YApUcS35nUhsfDCXb_ZFqVZRvqoCTPhfNkwWyM5N7SJ4wGTKKO6wO2xv5d8h81cA45kcjU-85Ua_nh8mXiFi7JwSJxshLjiuucB-oWBwQWfCWGRHj2hn3KhLViIvQBnOlcZoWvFK40l6WhTYKA7urWr_NUsTXa9jK0GiYkJB3ujT73c8gHQ4vJE93g',
    'Content-Type': 'application/json'
  },
  httpsAgent: new https.Agent({ // ssl insecure
    rejectUnauthorized: false
  })
})

// utils
const getSelector = () => {
  if (store.state.claims && store.state.claims.level <= 0) return {}
  return {
    params: {
      labelSelector: 'user=' + store.userID
    }
  }
}

// instances
const getInstances = async () => {
  // get pods data
  const { data } = await kube.get('/pods', getSelector())
  var servicedata = await kube.get('/services', getSelector())
  servicedata = servicedata.data

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
