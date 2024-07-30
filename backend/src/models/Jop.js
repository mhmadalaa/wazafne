const mongoose = require('mongoose');

const jopSchema = new mongoose.Schema({
  employer_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Employer',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Jop must have a title'],
    minlength: [5, 'Jop title must be at least 5 characters'],
  },
  body: {
    type: String,
    required: [true, 'Jop must have a body'],
    minlength: [20, 'Jop title must be at least 20 characters'],
  },
  accept_applications: {
    type: Boolean,
    default: true,
  },
  createdAt: Date,
});

module.exports = mongoose.model('Jop', jopSchema);
