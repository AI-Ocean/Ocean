const mongoose = require('mongoose');
const User = require('./user')

const statuses = ['rejected', 'approved', 'pending'];

const RequestQuotaSchema = new mongoose.Schema({
  quota: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: statuses,
    default: 'pending',
    required: true
  },
  rejectedReason: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('RequestQuota', RequestQuotaSchema);