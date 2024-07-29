const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('./../models/User');
const Employer = require('./../models/Employer');
const Employee = require('./../models/Employee');
const sendEmail = require('./../utils/email');
const hashOtp = require('./../utils/hashOtp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// create and send jwt-token in login, confirm-signup, change account email or password
const createSendToken = (res, status, user) => {
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRE_IN,
  });

  res.status(status).json({
    status: 'success',
    user,
    token,
  });
};

// send otp code to users to complete there actions via email service
const sendEmailWithOtp = async (user, otp, res, email) => {
  try {
    await sendEmail({
      email: email || user.email,
      subject: 'Email Confirm',
      message: `That's a 30 minute valid otp ${otp} `,
    });

    res.status(200).json({
      status: 'success',
      message: 'An email sent to you to complete the steps.',
    });
  } catch (err) {
    user.otpExpires = undefined;
    user.otp = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({
      status: 'fail',
      message: 'There is an error while sending the email, pleas try again!',
    });
  }
};

// user ask for singup with email, password, and either employer or employee
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    createdAt: Date.now(),
  });
  newUser.authenticated = false;

  const otp = newUser.createOtp();
  await newUser.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: newUser.email,
      subject: 'Email Confirm',
      message: `That's a 30 minutes valid otp ${otp} to Confirm your Email`,
    });

    res.status(200).json({
      status: 'success',
      message: 'An email will be send to complete the steps',
    });
  } catch (err) {
    await User.findByIdAndDelete(newUser._id);
    res.status(500).json({
      status: 'fail',
      message: 'There is an error while sending the email, pleas signup again!',
    });
  }
});

// when user ask for signup, the intial step is enter the email and password
// we then validate that email with user by sending otp-code to the user
// to use this code ot confirm signup process, so we be sure that it's his email
exports.confirmSignup = catchAsync(async (req, res, next) => {
  const hashedOtp = hashOtp(req.body.otp);

  const user = await User.findOne({
    email: req.body.email,
    otp: hashedOtp,
    otpExpires: { $gt: Date.now() },
    authenticated: false,
  });
  if (!user) {
    return res.status(401).json({
      status: 'fail',
      message: 'Otp is invalide or has been expired!',
    });
  }

  /*
  based on user role employer or employee
  take the user data, validate it, add role_id in user entitiy
  */
  if (user?.role === 'employer') {
    const employer = await Employer.create({
      user_id: user._id,
      name: req.body.name,
      contact_email: req.body.contact_email,
      createdAt: Date.now(),
    });

    if (employer) {
      user.role_id = employer._id;
    } else {
      return res.status(406).json({
        status: 'error',
        message: 'please, complete the required information to signup!',
      });
    }
  } else if (user?.role === 'employee') {
    const employee = await Employee.create({
      user_id: user._id,
      name: req.body.name,
      contact_email: req.body.contact_email,
      nationalID: req.body.nationalID,
      city: req.body.city,
      bio: req.body.bio,
      programming_languages: req.body.programming_languages,
      experience_level: req.body.experience_level,
      createdAt: Date.now(),
    });

    if (employee) {
      user.role_id = employee._id;
    } else {
      return res.status(406).json({
        status: 'error',
        message: 'please, complete the required information to signup!',
      });
    }
  }

  user.authenticated = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  createSendToken(res, 201, user);
});

// what if user mising the login actions, like not use the token
// on the valid time, or facing an error with email sent!
// we provide resend the code endpoint to resend a valid otp code
// during oneday after first signup process
// cause after one-day if the signup process not confirmed throw the otp-code
// the user will be deleted automatically from the system and need to signup again
exports.resendOtp = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'There is no user with that email address',
    });
  }
  if (user.authenticated) {
    return res.status(400).json({
      status: 'fail',
      message: 'Your account is already authenticated',
    });
  }
  const confirmOtp = user.createOtp();
  await user.save({ validateBeforeSave: false });

  sendEmailWithOtp(user, confirmOtp, res);
});

// login the user with his email and password, and send back 
// jwt-token to use in the upcoming login until that token expires.
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 'fail',
      message: 'You must provide an email address',
    });
  }

  if (!password) {
    return res.status(400).json({
      status: 'fail',
      message: 'You must provide a password',
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'There is an error with your email or password!',
    });
  }
  if (!user.authenticated) {
    return res.status(401).json({
      status: 'fail',
      message: 'Your account is not verified, Please verify your account.',
    });
  }
  if (!(await user.correctPassword(password, user.password))) {
    return res.status(404).json({
      status: 'fail',
      message: 'There is an error with your email or password!',
    });
  }

  createSendToken(res, 200, user);
});

// check if user is login or not via jwt-token, 
// and if login extract user data and put it in the request 
// for the upcoming actions in the application
exports.isLogin = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    return res.status(401).json({
      status: 'fail',
      message: 'You must be logged in to access this page!',
    });
  }

  const token = req.headers.authorization.split(' ')[1];
  const decode = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
  const user = await User.findById(decode.id);
  if (!user || !user.authenticated) {
    return res.status(401).json({
      status: 'fail',
      message: 'User must Register or login to access this route',
    });
  }

  if (user.changedPasswordAfter(decode.iat)) {
    return res.status(401).json({
      status: 'fail',
      message: 'Password is incorrect',
    });
  }

  req.user = user;
  next();
});

exports.isEmployer = catchAsync(async (req, res, next) => {
  if (req?.user?.role === 'employer') {
    next();
  } else {
    next(new AppError('That is not an employer type of user!', 404));
  }
});

exports.isEmployee = catchAsync(async (req, res, next) => {
  if (req?.user?.role === 'employee') {
    next();
  } else {
    next(new AppError('That is not an employee type of user!', 404));
  }
});

// user request that he forget his password!!
exports.forgetPassword = async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    authenticated: true,
  });
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'There is no user with this email address!',
    });
  }
  const resetOtp = user.createOtp();
  await user.save({ validateBeforeSave: false });
  sendEmailWithOtp(user, resetOtp, res);
};

// after user request of forgetting his password, 
// will redirect to this endpoint to reset his password with new one
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedOtp = hashOtp(req.body.otp);

  const user = await User.findOne({
    email: req.body.email,
    otp: hashedOtp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(401).json({
      status: 'fail',
      message: 'Otp is invalide or has been expired!',
    });
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  if (user.password && user.password === user.passwordConfirm) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
  } else {
    return res.status(400).json({
      status: 'fail',
      message: 'Password is invalide or not match the confirmation!',
    });
  }
  createSendToken(res, 200, user);
});

// user request to change his email
exports.changeEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const resetOtp = user.createOtp();
  await user.save({ validateBeforeSave: false });
  sendEmailWithOtp(user, resetOtp, res, req.body.newEmail);
});

// after user request he needs to change his account email,
// he will redirect to this endpoint to complete the change it.
exports.resetEmail = catchAsync(async (req, res, next) => {
  const hashedOtp = hashOtp(req.body.otp);
  const user = await User.findOne({
    otp: hashedOtp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(401).json({
      status: 'fail',
      message: 'Otp is invalide or has been expired!',
    });
  }

  user.email = req.body.newEmail;

  if (user.email) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
  } else {
    return res.status(400).json({
      status: 'fail',
      message: 'Provide a valid email!',
    });
  }
  createSendToken(res, 200, user);
});

// when user remember his current password put needs to change it.
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return res.status(400).json({
      status: 'fail',
      message: 'This password is incorrect, try again.',
    });
  }
  if (req.body.newPassword === req.body.newPasswordConfirm) {
    user.password = req.body.newPassword;
    await user.save({ validateBeforeSave: false });
  } else {
    return res.status(400).json({
      status: 'fail',
      message: 'Password is invalide or not match the confirmation.',
    });
  }
  createSendToken(res, 200, user);
});
