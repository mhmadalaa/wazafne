const Employer = require('./../models/Employer');
const User = require('./../models/User');
const sendEmail = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.updateEmployerProfile = catchAsync(async (req, res, next) => {
  if (req.body.email || req.body.password || req.body.passwordConfirm) {
    return res.status(401).json({
      status: 'fail',
      message:
        'You can not update curcial data with this regualar update router',
    });
  }

  const user = await User.findById(req.user.id);

  // construct the update object
  const update = {};

  if (req.body.name) {
    update.name = req.body.name;
  }

  if (req.body.contact_email) {
    update.contact_email = req.body.contact_email;
  }

  const employerProfile = await Employer.findByIdAndUpdate(
    user.profile_id,
    update,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      employerProfile,
    },
  });
});

exports.employerProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const employerProfile = await Employer.findById(user.profile_id);

  res.status(200).json({
    status: 'success',
    data: {
      employerProfile,
    },
  });
});
