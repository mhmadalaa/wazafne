const mongoose = require('mongoose');
const validator = require('validator');

const employerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'User must have a name'],
    minlength: [2, 'User name must be at least 2 characters'],
    maxlength: [15, 'User name must be at most 15 characters'],
  },
  contact_email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Enter a valid email',
    },
  },
  createdAt: Date,
});

module.exports = mongoose.model('Employer', employerSchema);
