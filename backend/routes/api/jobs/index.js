var router = require('express').Router()
var { kubeAPI, kubeJobAPI, getSelector, getUserID, kubeAPI } = require('../../../utils')

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
      limits,
      requests,
      volumes: job.spec.template.spec.volumes.filter(i => i.persistentVolumeClaim !== undefined), // filter only pvc
      command
    }
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
      backoffLimit: 0,
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
          },
          tolerations: [
            {
              key: 'runtype',
              operator: "Equal",
              value: (gpu == 4 ? 'gpu4job' : 'gpu2job'),
              effect: "NoSchedule"
            }
          ]
        }
      }
    }
  }
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
  var jobname = req.params.id
  // get job pod
  console.log(jobname)
  const pods = await kubeAPI.get('/namespaces/ml-instance/pods?labelSelector=job-name=' + jobname)
  console.log(pods.data)
  console.log(pods.data.items)
  // delete job pod
  pods.data.items.forEach(async pod => {
    const name = pod.metadata.name
    const r = await kubeAPI.delete('/namespaces/ml-instance/pods/'+ name)
  })
  // delete job
  const response = await kubeJobAPI.delete('/namespaces/ml-instance/jobs/' + jobname)
  res.send(response.data)
})

module.exports = router
