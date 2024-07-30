const Employee = require('./../models/Employee');
const User = require('./../models/User');
const sendEmail = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.updateEmployeeProfile = catchAsync(async (req, res, next) => {
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

  // Add new prgramming languages to the list
  if (
    req.body.add_programming_languages &&
    req.body.add_programming_languages.length > 0
  ) {
    update.$push = {
      programming_languages: { $each: req.body.add_programming_languages },
    };
  }

  // remove programming languages from the list
  if (
    req.body.remove_programming_languages &&
    req.body.remove_programming_languages.length > 0
  ) {
    update.$pull = {
      programming_languages: { $in: req.body.remove_programming_languages },
    };
  }

  if (req.body.name) {
    update.name = req.body.name;
  }
  if (req.body.nationalID) {
    update.nationalID = req.body.nationalID;
  }
  if (req.body.city) {
    update.city = req.body.city;
  }
  if (req.body.contact_email) {
    update.contact_email = req.body.contact_email;
  }
  if (req.body.bio) {
    update.bio = req.body.bio;
  }
  if (req.body.experience_level) {
    update.experience_level = req.body.experience_level;
  }
  if (req.body.open_to_work === true || req.body.open_to_work === false) {
    update.open_to_work = req.body.open_to_work === true;
  }

  const employeeProfile = await Employee.findByIdAndUpdate(
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
      employeeProfile,
    },
  });
});

exports.employeeProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const employeeProfile = await Employee.findById(user.profile_id);

  res.status(200).json({
    status: 'success',
    data: {
      employeeProfile,
    },
  });
});
