var router = require('express').Router()
var { kubeAPI, kubeJobAPI, getSelector, getUserID, kubeAPI } = require('../../../utils')

// Get Jobs
router.get('/', async (req, res) => {
  // get jobs data
  const { data } = await kubeJobAPI.get('/namespaces/ml-instance/jobs', getSelector(req.claims, 'job'))

  // final response
  const response = {
    jobNumber: data.items.length,
    jobs: []
  }

  // get job details
  for ( const job of data.items ) {
    const limits = job.spec.template.spec.containers[0].resources.limits
    const requests = job.spec.template.spec.containers[0].resources.requests
    const command = job.spec.template.spec.containers[0].command
    const { name, labels } = job.metadata

    // pod data
    const podres = await kubeAPI.get('/namespaces/ml-instance/pods?labelSelector=job-name=' + name)
    const status = (0 in podres.data.items) ? podres.data.items[0].status.phase : 'Failed'
    // job data
    const jobData = {
      name,
      labels,
      status,
      limits,
      requests,
      volumes: job.spec.template.spec.volumes.filter(i => i.persistentVolumeClaim !== undefined), // filter only pvc
      command,
      startTime: job.status.startTime,
      completionTime: job.status.completionTime
    }
    response.jobs.push(jobData)
  }
  res.send(response)
})

// Create pod
router.post('/', async (req, res) => {
  var name = req.body.name
  var image = req.body.image
  var cpu = req.body.cpu_request
  var memory = req.body.memory_request + 'Gi'
  var gpu = req.body.gpu_request
  var gpu_type = req.body.gpu_type
  var claimName = req.body.volume_name
  var command = req.body.command

  const metadata = {
    name,
    labels: {
      app: 'job',
      user: getUserID(req.claims),
      accelerator: gpu_type,
      jobtype: gpu.toString()
    }
  }

  const jobData = {
    kind: 'Job',
    apiVersion: 'batch/v1',
    metadata,
    spec: {
      completions: 1,
      parallelism: 1,
      backoffLimit: 0,
      activeDeadlineSeconds: 60 * 60 * 24 * 5, // 5 days,
      ttlSecondsAfterFinished: 60 * 60 * 24 * 60, // 30 days
      template: {
        metadata,
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
              image,
              imagePullPolicy: 'Always',
              command,
              resources: { 
                limits: { memory, cpu, 'nvidia.com/gpu': gpu },
                requests: { memory: '10Gi', cpu: gpu, 'nvidia.com/gpu': gpu }
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
            accelerator: gpu_type,
            app: 'job',
            jobtype: gpu.toString()
          },
          tolerations: [
            {
              key: "dedicated",
              value: "gpu",
              operator: "Equal",
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
    console.error(err)
    res.status(503).send(err)
  }

  const response = {
    job: job.data
  }

  res.send(response)
})

router.delete('/:id', async (req, res) => {
  var jobname = req.params.id
  // get job pod
  const pods = await kubeAPI.get('/namespaces/ml-instance/pods?labelSelector=job-name=' + jobname)
  // delete job
  const response = await kubeJobAPI.delete('/namespaces/ml-instance/jobs/' + jobname)
  // delete job pod
  for ( const pod of pods.data.items ) {
    const name = pod.metadata.name
    await kubeAPI.delete('/namespaces/ml-instance/pods/'+ name)
  }
  res.send(response.data)
})

// Get Job Logs
router.get('/:id/log', async (req, res) => {
  // get pod for job
  var { data } = await kubeAPI.get('/namespaces/ml-instance/pods?labelSelector=job-name=' + req.params.id)
  const podname = data.items[0].metadata.name

  // get jobs data
  var { data } = await kubeAPI.get('/namespaces/ml-instance/pods/' + podname + '/log')

  // final response
  const response = {
    logs: data
  }
  res.send(response)
})

module.exports = router
