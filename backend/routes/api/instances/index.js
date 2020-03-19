var router = require('express').Router()
var { kubeAPI, getSelector, getUserID } = require('../../../utils')

// Get Instances
router.get('/', async (req, res) => {
  // get pods data
  const { data } = await kubeAPI.get('/pods', getSelector(req.claims))
  var servicedata = await kubeAPI.get('/services', getSelector(req.claims))
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
  res.send(response)
})

// Create pod
router.post('/', async (req, res) => {
  var name = req.body.name
  var cpu = req.body.cpu_request
  var memory = req.body.memory_request + 'Gi'
  var gpu = req.body.gpu_request
  var claimName = req.body.volume_name

  const metadata = {
    name,
    labels: {
      app: name,
      user: getUserID(req.claims)
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

  const { data } = await kubeAPI.post('/pods', podData)
  var servicedata = await kubeAPI.post('/services', serviceData)
  servicedata = servicedata.data

  var response = []
  response.push(data)
  response.push(servicedata)

  res.send(response)
})

router.delete('/:id', async (req, res) => {
  var podname = req.params.id
  const response = await kubeAPI.delete('/pods/' + podname)
  await kubeAPI.delete('/services/' + podname)
  res.send(response.data)
})

module.exports = router;
