const Jop = require('./../models/Jop');
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
