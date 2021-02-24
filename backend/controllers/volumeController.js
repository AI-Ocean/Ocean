var { kubeAPI, getSelector, getUserID } = require('../utils')

module.exports.get_volumes_list = async (req, res) => {
  let data
  try{
    vol = await kubeAPI.get('/namespaces/ml-instance/persistentvolumeclaims', getSelector(req.user, 'vol'))
    data = vol.data
  } catch (err) {
    return res.status(503).json(err.response.data)
  }
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
  return res.json(response)
}

module.exports.create_volume = async (req, res) => {
  var name = req.body.name
  var capacity = req.body.capacity + 'Gi'

  const metadata = {
    name,
    labels: {
      user: getUserID(req.user),
      app: 'vol'
    }
  }
  const spec = {
    storageClassName: 'nfs',
    accessModes: [ 'ReadWriteOnce' ],
    resources: { requests: { 'storage': capacity } }
  }

  const volumeData = {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata,
    spec
  }

  let data
  try {
    const vol = await kubeAPI.post('/namespaces/ml-instance/persistentvolumeclaims', volumeData)
    data = vol.data
  } catch (err) {
    console.error(err.response.data)
    return res.status(503).json(err.response.data)
  }
  return res.status(201).json(data)
}

module.exports.delete_volume = async (req, res) => {
  const volumename = req.params.id
  let data
  try {
    const vol = await kubeAPI.delete('/namespaces/ml-instance/persistentvolumeclaims/' + volumename)
    data = vol.data
  } catch (err) {
    return res.status(503).json(err.response.data)
  }
  return res.status(204).json(data)
}
