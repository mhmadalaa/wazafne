const mongoose = require('mongoose');
const validator = require('validator');
const { isValid } = require('egyptian-nationalid');

const employeeSchema = new mongoose.Schema({
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
  // FIXME: it's validate only egyption national ids
  nationalID: {
    type: String,
    required: [true, 'Please provide your National ID'],
    unique: true,
    validate: {
      // validate 14 numbers and valide with egyption data
      validator: function (val) {
        return isValid && /^\d+$/.test(val) && val.length === 14;
      },
      message: 'Enter a valid Egyption National ID',
    },
  },
  city: {
    type: String,
    required: [true, 'User must provide his city'],
    maxlength: 25,
  },
  bio: {
    type: String,
    required: [
      true,
      'Please provide a bio for your account to help other reach you',
    ],
    minlength: 8,
  },
  programming_languages: [
    {
      type: String,
    },
  ],
  experience_level: {
    type: String,
    enum: ['Junior', 'Mid', 'Senior'],
    required: true,
  },
  open_to_work: {
    type: Boolean,
    default: true,
  },
  createdAt: Date,
});

module.exports = mongoose.model('Employee', employeeSchema);
