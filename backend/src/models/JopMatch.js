const mongoose = require('mongoose');

const jopMatchSchema = new mongoose.Schema({
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
  createdAt: Date,
});

module.exports = mongoose.model('JopMatch', jopMatchSchema);
