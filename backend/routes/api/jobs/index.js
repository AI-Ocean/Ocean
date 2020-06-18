var router = require('express').Router()
var { kubeJobAPI, getSelector, getUserID } = require('../../../utils')

// Get Jobs
router.get('/', async (req, res) => {
  // get jobs data
  const { data } = await kubeJobAPI.get('/namespaces/ml-instance/jobs', getSelector(req.claims))

  // final response
  const response = {
    jobNumber: data.items.length,
    jobs: []
  }

  // get job details
  data.items.forEach(job => {
    const limits = job.spec.template.spec.containers[0].resources.limits
    const requests = job.spec.template.spec.containers[0].resources.requests
    const command = job.spec.template.spec.containers[0].command
    const { name, labels } = job.metadata

    // job data
    const jobData = {
      name,
      labels,
      status: job.status,
      node_name: job.spec.template.spec.nodeName,
      limits,
      requests,
      volumes: job.spec.template.spec.volumes.filter(i => i.persistentVolumeClaim !== undefined), // filter only pvc
      command
    }
    console.log(jobData)
    response.jobs.push(jobData)
  })
  res.send(response)
})

// Create pod
router.post('/', async (req, res) => {
  var name = req.body.name
  var cpu = req.body.cpu_request
  var memory = req.body.memory_request + 'Gi'
  var gpu = req.body.gpu_request
  var gpu_type = req.body.gpu_type.name
  var claimName = req.body.volume_name
  var command = req.body.command

  const metadata = {
    name,
    labels: {
      app: name,
      user: getUserID(req.claims),
      accelerator: gpu_type
    }
  }

  const jobData = {
    kind: 'Job',
    apiVersion: 'batch/v1',
    metadata,
    spec: {
      backoffLimit: 1,
      template: {
        spec: {
          restartPolicy: 'Never',
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
              image: 'mlvclab/pytorch:1.5-cuda10.1-cudnn7-devel',
              imagePullPolicy: 'Always',
              command,
              resources: { 
                limits: { memory, cpu, 'nvidia.com/gpu': gpu },
                requests: { memory: '1Gi', cpu: 1, 'nvidia.com/gpu': gpu }
              },
              volumeMounts: [
                {
                  name: 'main-storage',
                  mountPath: '/root/volume'
                },
                {
                  name: 'dataset',
                  mountPath: '/dataset',
                  readOnly: true
                },
                {
                  name: 'dshm',
                  mountPath: '/dev/shm'
                }
              ]
            }
          ],
          nodeSelector: {
            accelerator: gpu_type
          }
        }
      }
    }
  }
  console.log(jobData)
  var job
  try {
    job = await kubeJobAPI.post('/namespaces/ml-instance/jobs', jobData)
  } catch(err) {
    // console.log(err)
    res.statusCode(503).send(err)
  }

  const response = {
    job: job.data
  }

  res.send(response)
})

router.delete('/:id', async (req, res) => {
  var podname = req.params.id
  const response = await kubeAPI.delete('/namespaces/ml-instance/pods/' + podname)
  await kubeAPI.delete('/namespaces/ml-instance/services/' + podname)
  res.send(response.data)
})

module.exports = router
