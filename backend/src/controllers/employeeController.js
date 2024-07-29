const Employee = require('./../models/Employee');
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

  const user = await Employee.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});