const axios = require('axios');
const Employer = require('./../models/Employer');
const Employee = require('./../models/Employee');
const User = require('./../models/User');
const sendEmail = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const AI_API = process.env.AI_API;

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

// search for employees based on ai-semantic-search
// send to ai text to search by, and it will retrieve a list of employees ids
// then extract the employees profiles and send to client
exports.searchForEmployees = catchAsync(async (req, res, next) => {
  // extract search arguments from employer
  const searchArguments = {
    programming_languages: req.body.programming_languages,
    city: req.body.city,
    experience_level: req.body.experience_level, // TODO: validate it
    bio: req.body.bio,
  };

  // stringfy the search arguments object. and send it to ai model
  axios
    .post(`${AI_API}/find_matched_employees`, {
      data: {
        job_text: JSON.stringify(searchArguments),
      },
    })
    .then(async (response) => {
      // response.data -- list of employee [id]
      try {
        const employee_ids = response.data.matched_employee_ids;

        const matched_employees = [];
        for (let i = 0; i < employee_ids.length; ++i) {
          const employee = await Employee.findById(employee_ids[i]);

          if (employee) {
            matched_employees.push(employee);
          } else {
            console.error(
              `✗ Employee ${employee_ids[i]} not a valid employee in the database!`,
            );
          }
        }

        res.status(200).json({
          status: 'success',
          length: matched_employees.length,
          data: {
            matched_employees,
          },
        });
      } catch (error) {
        console.error(
          '✗ Error while retrieving employees profiles from database',
          error,
        );
      }
    })
    .catch(function (error) {
      res.status(500).json({
        message:
          'can not connect to ai-api to search for matched employees to the employer filtering',
      });
    });
});
