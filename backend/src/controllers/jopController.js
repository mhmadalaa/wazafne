const mongoose = require('mongoose');
const Jop = require('./../models/Jop');
const JopApplicant = require('./../models/JopApplicant');
const sendEmail = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// create a jop only by the employers
exports.createJop = catchAsync(async (req, res, next) => {
  const jop = await Jop.create({
    title: req.body.title,
    body: req.body.body,
    employer_id: req.user.profile_id,
    createdAt: Date.now(),
  });

  res.status(200).json({
    status: 'success',
    data: {
      jop,
    },
  });
});

// edit jop by the employer who created
exports.editJop = catchAsync(async (req, res, next) => {
  // to update find by the jop and enusre that user employer profile is that who post it
  const jop = await Jop.findOneAndUpdate(
    { _id: req.params.id, employer_id: req.user.profile_id },
    {
      title: req.body.title,
      body: req.body.body,
      accept_applications: req.body.accept_applications,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      jop,
    },
  });
});

// all jops that the logged in employer has been created
exports.listCreatedJops = catchAsync(async (req, res, next) => {
  // to update find by the jop and enusre that user employer profile is that who post it
  const jops = await Jop.find({ employer_id: req.user.profile_id });

  res.status(200).json({
    status: 'success',
    length: jops.length,
    data: {
      jops,
    },
  });
});

// employee apply for a jop
exports.applyForJop = catchAsync(async (req, res, next) => {
  // check if applied before
  const application = await JopApplicant.findOne({
    jop_id: req.params.id,
    employee_id: req.user.profile_id,
  });
  if (application) {
    return next(new AppError('you already applied for this jop.', 400));
  }

  // check if jop still accept applications or not
  const jop = await Jop.findById(req.params.id);
  if (jop.accept_applications === false) {
    return next(
      new AppError('Sorry, this jop no longer accept applications.', 400),
    );
  }

  // the state of user acceptence or not is by default `no-response`
  await JopApplicant.create({
    jop_id: req.params.id,
    employee_id: req.user.profile_id,
  });

  res.status(200).json({
    status: 'success',
  });
});

// list all applicatns that apply for a specific jop
exports.listJopApplicants = catchAsync(async (req, res, next) => {
  // validate if the logged in user is the employer who post the jop
  if (!isJopEmployer) {
    return next(
      new AppError(
        'You are not posted this jop, so you can not see the applicants!',
        404,
      ),
    );
  }

  // search in jop applicants and populate the employee profiles
  const applicants = await JopApplicant.find({
    jop_id: req.params.id,
  }).populate('employee_id');

  res.status(200).json({
    status: 'success',
    length: applicants.length,
    data: {
      applicants,
    },
  });
});

// accept employee application
exports.acceptApplication = catchAsync(async (req, res, next) => {
  // validate if the logged in user is the employer who post the jop
  if (!isJopEmployer) {
    return next(
      new AppError(
        'You are not posted this jop, so you can not see the applicants!',
        404,
      ),
    );
  }

  // change the jop-applicant status for the user to accepted
  const jopApplicatioin = await JopApplicant.findOneAndUpdate(
    {
      employee_id: req.query.employee_id,
      jop_id: req.query.jop_id,
    },
    { status: 'accepted' },
    { new: true },
  ).populate('employee_id');

  // send acceptance email to the employee

  res.status(200).json({
    status: 'success',
    message: 'accepted appplicant',
  });
});

// reject employee application
exports.rejectApplication = catchAsync(async (req, res, next) => {
  // validate if the logged in user is the employer who post the jop
  if (!isJopEmployer) {
    return next(
      new AppError(
        'You are not posted this jop, so you can not see the applicants!',
        404,
      ),
    );
  }

  // change the jop-applicant status for the user to rejected
  const jopApplicatioin = await JopApplicant.findOneAndUpdate(
    {
      employee_id: req.query.employee_id,
      jop_id: req.query.jop_id,
    },
    { status: 'rejected' },
    { new: true },
  ).populate('employee_id');

  // send rejection email to the employee

  res.status(200).json({
    status: 'success',
    message: 'rejected appplicant',
  });
});

// enforce that the request have jop_id and employee_id query parameters
// and they are a valid mongodb ids
exports.enforceQueryParams = (req, res, next) => {
  if (
    req?.query &&
    req.query.jop_id &&
    mongoose.Types.ObjectId.isValid(req.query.jop_id) &&
    req.query.employee_id &&
    mongoose.Types.ObjectId.isValid(req.query.employee_id)
  ) {
    return next();
  }

  return next(
    new AppError(
      'Missing required query parameters, it should be in the form ?jop_id=[mongoID]&employee_id=[mongoID]',
      400,
    ),
  );
};

const isJopEmployer = async (req) => {
  // validate if the logged in user is the employer who post the jop
  const jop = await Jop.findById(req.params.id);

  return new mongoose.Types.ObjectId(jop.employer_id).equals(
    req.user.profile_id,
  );
};
