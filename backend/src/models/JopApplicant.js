const mongoose = require('mongoose');

const jopApplicantSchema = new mongoose.Schema({
  jop_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Jop',
    required: true,
  },
  employee_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Employee',
    required: true,
  },
  status: {
    type: String,
    enum: ['no-response', 'accepted', 'rejected'],
    default: 'no-response',
  },
  createdAt: Date,
});

module.exports = mongoose.model('JopApplicant', jopApplicantSchema);
