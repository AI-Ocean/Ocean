var router = require('express').Router()
var { kubeAPI, getSelector, getUserID } = require('../../../utils')

router.get('/', async (req, res) => {
  const { data } = await kubeAPI.get('/namespaces/ml-instance/persistentvolumeclaims', getSelector(req.claims))
  const response = {
    volumes: []
  }

  data.items.forEach(volume => {
    const name = volume.metadata.name
    const labels = volume.metadata.labels
    const capacity = volume.status.capacity.storage
    const status = volume.status.phase

    const volumeData = {
      name,
      labels,
      capacity,
      status
    }
    response.volumes.push(volumeData)
  })
  res.send(response)
})

router.post('/', async (req, res) => {
  var name = req.body.name
  var storage = req.body.storage_request + 'Gi'

  const metadata = {
    name,
    labels: {
      user: getUserID(req.claims)
    }
  }
  const spec = {
    storageClassName: 'nfs',
    accessModes: [ 'ReadWriteOnce' ],
    resources: { requests: { storage } }
  }

  const volumeData = {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata,
    spec
  }

  const { data } = await kubeAPI.post('/namespaces/ml-instance/persistentvolumeclaims', volumeData)
  res.send(data)
})

// Delete volume
router.delete('/:id', async (req, res) => {
  var volumename = req.params.id
  const response = await kubeAPI.delete('/namespaces/ml-instance/persistentvolumeclaims/' + volumename)
  res.send(response.data)
})

module.exports = router
