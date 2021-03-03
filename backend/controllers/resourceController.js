const mongoose = require('mongoose')
var { kubeAPI } = require('../utils')

const userDAO = require("../models/user")
const RequestQuota = require('../models/requestQuota')

module.exports.get_resources = async (req, res) => {
  let data
  try{
    // get pods data
    const pod = await kubeAPI.get('/nodes?labelSelector=accelerator')
    data = pod.data
  } catch (err) {
    return res.status(503).json(err.response.data)
  }

  // sum resources
  const total = {
    cpus: 0,
    mem: 0,
    gpus: 0,
    capacity: 6000
  }

  data.items.forEach(v => {
    const { cpu, memory } = v.status.capacity
    const gpu = v.status.capacity['nvidia.com/gpu']

    total.cpus += Number(cpu)
    total.mem += Math.round(Number(memory.slice(0, -2)) / 1024 / 1024)
    total.gpus += Number(gpu)
  })

  return res.json(total)
}

module.exports.get_resource_request_quota = async (req, res, next) => {
  let requests
  try {
    requests = await RequestQuota.find({ user: mongoose.Types.ObjectId(req.user._id) })
  } catch (err) {
    next(err)
  }
  return res.status(200).json(requests)
}

module.exports.create_resource_request_quota = async (req, res, next) => {
  // Field check
  if (!req.body.quota || !req.body.startDate || !req.body.endDate || !req.body.reason) {
    return res.status(400).json({
      msg: 'Please pass quota, startDate, endDate and reason.'
    });
  }

  let { quota, startDate, endDate, reason } = req.body

  // Create new Request
  let newRequest = new RequestQuota({
    quota,
    startDate,
    endDate,
    reason,
    user: mongoose.Types.ObjectId(req.user._id)
  })

  try {
    await newRequest.save()
  } catch (err) {
    return next(err)
  }
  return res.status(201).json({ msg: 'Successful created Quota request.' });
}

module.exports.modify_resource_request_quota = async (req, res, next) => {
  const { uid } = req.params
  let { status, rejectedReason } = req.body

  try {
    const request = await RequestQuota.findById(uid);
    if (!request) return res.status(404).json({msg: 'request not found.'});

    if (req.user.role !== 'admin' && req.user._id.toString() !== request.user ) {
      return res.status(403).json({msg: 'Permission Denied.'})
    }

    if (status) request.status = status;
    if (rejectedReason) request.rejectedReason = rejectedReason;

    await request.save();

  } catch (err) {
    next(err)
  }
  return res.json({message: 'request updated'})
}

module.exports.delete_resource_request_quota = async (req, res, next) => {
  const { uid } = req.params

  try {
    const request = await RequestQuota.findById(uid);
    if (!request) return res.status(404).json({msg: 'request not found.'});

    if (req.user.role !== 'admin' && req.user._id.toString() !== request.user ) {
      return res.status(403).json({msg: 'Permission Denied.'})
    }

    await request.deleteOne()
  } catch (err) {
    return next(err)
  }
  return res.status(204).end();
}
