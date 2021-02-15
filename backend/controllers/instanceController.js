var { kubeAPI, getSelector, getUserID } = require('../utils')

// get instances list
module.exports.get_instances_list = async (req, res) => {
  let podData, serviceData
  try {
    // get pods, services data
    let pod = await kubeAPI.get('/namespaces/ml-instance/pods', getSelector(req.user, 'inst'))
    podData = pod.data
    let service = await kubeAPI.get('/namespaces/ml-instance/services', getSelector(req.user, 'inst'))
    serviceData = service.data
  } catch (err) {
    res.status(503).json(err.response.data)
  }

  // final response
  const response = {
    podNumber: podData.items.length,
    pods: []
  }

  // get pod details
  podData.items.forEach(pod => {
    const limits = pod.spec.containers[0].resources.limits
    const requests = pod.spec.containers[0].resources.requests
    const { name, labels } = pod.metadata
    let nodePort = 0

    serviceData.items.forEach(service => {
      if (service.metadata.name === name) {
        nodePort = service.spec.ports[0].nodePort
      }
    })

    // instance data
    const data = {
      name,
      labels,
      status: pod.status.phase,
      node: pod.spec.nodeName,
      limits,
      requests,
      volumes: pod.spec.volumes.filter(i => i.persistentVolumeClaim !== undefined), // filter only pvc
      nodePort
    }

    response.pods.push(data)
  })
  res.json(response)
}

// create instance
module.exports.create_instance = async (req, res) => {
  var name = req.body.name
  var image = req.body.image
  var cpu = req.body.cpu_request
  var memory = req.body.memory_request + 'Gi'
  var gpu = req.body.gpu_request
  var gpu_type = req.body.gpu_type
  var claimName = req.body.volume_name

  const metadata = {
    name,
    labels: {
      app: 'inst',
      user: getUserID(req.user),
      accelerator: gpu_type,
      name
    }
  }

  const podData = {
    kind: 'Pod',
    apiVersion: 'v1',
    metadata,
    spec: {
      restartPolicy: 'Always',
      volumes: [
        {
          name: 'main-storage',
          persistentVolumeClaim: { claimName }
        },
        {
          name: 'dataset',
          hostPath: { path: '/data/dataset' }
        },
        {
          name: 'dshm',
          emptyDir: {
            medium: 'Memory'
          }
        }
      ],
      containers: [
        {
          name,
          image,
          imagePullPolicy: 'Always',
          resources: { 
            limits: { memory, cpu, 'nvidia.com/gpu': gpu },
            requests: { memory: '1Gi', cpu: 1, 'nvidia.com/gpu': gpu }
          },
          ports: [ { name: 'ssh', containerPort: 22 } ],
          volumeMounts: [
            {
              name: 'main-storage',
              mountPath: '/root/volume'
            },
            {
              name: 'dataset',
              mountPath: '/dataset',
              readOnly: req.user.role === 'admin' ? true : false
            },
            {
              name: 'dshm',
              mountPath: '/dev/shm'
            }
          ]
        }
      ],
      nodeSelector: {
        accelerator: gpu_type,
        app: 'inst'
      }
    }
  }

  const serviceData = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata,
    spec: {
      type: 'NodePort',
      selector: { name },
      ports: [{
        port: 22,
        targetPort: 22,
        protocol: 'TCP',
        name: 'ssh'
      }]
    }
  }

  let pod, service
  try {
    pod = await kubeAPI.post('/namespaces/ml-instance/pods', podData)
    service = await kubeAPI.post('/namespaces/ml-instance/services', serviceData)
  } catch(err) {
    return res.status(503).json(err.response.data)
  }

  const response = {
    pod: pod.data,
    service: service.data
  }
  return res.status(201).json(response)
}

// delete instance
module.exports.delete_instance = async (req, res) => {
  var podname = req.params.id

  let pod, service
  try {
    pod = await kubeAPI.delete('/namespaces/ml-instance/pods/' + podname)
    service = await kubeAPI.delete('/namespaces/ml-instance/services/' + podname)
  } catch (err) {
    res.status(503).json(err.response.data)
  }
  const response = {
    pod: pod.data,
    service: service.data
  }
  res.status(204).json(response)
}
