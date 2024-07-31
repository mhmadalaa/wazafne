const axios = require('axios');
const Employee = require('./../models/Employee');
const User = require('./../models/User');
const sendEmail = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const JopMatch = require('../models/JopMatch');

const AI_API = process.env.AI_API;

// update employee profile including add or remove list of programming languages
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

    if (req.body.open_to_work === false) {
      // send employee to ai model to remove it from vector database
      // because employee mark that he is not open to work
      axios
        .delete(`${AI_API}/delete_employee`, {
          data: {
            employee_id: user.profile_id,
          },
        })
        .then((response) => {
          console.log(
            `Employee: ${user.profile_id} deleted from ai vector database due to employee not open to work status`,
          );
        })
        .catch(function (error) {
          console.error(
            'can not connect to ai-api to remove employee from ai vector database in case of change not open to work update',
          );
        });
    }
  }

  const employeeProfile = await Employee.findByIdAndUpdate(
    user.profile_id,
    update,
    {
      new: true,
      runValidators: true,
    },
  );

  // keep vector database match with profile updates
  if (
    req.body.bio ||
    req.body.city ||
    req.body.experience_level ||
    req.body.add_programming_languages ||
    req.body.remove_programming_languages
  ) {
    // delte the employee from ai vectordb and added it with the updated data
    // send employee to ai model to remove it from vector database
    // because employee mark that he is not open to work
    axios
      .delete(`${AI_API}/delete_employee`, {
        data: {
          employee_id: user.profile_id,
        },
      })
      .then((response) => {
        console.log(
          `Employee: ${user.profile_id} deleted from ai vector database due to employee not open to work status`,
        );
      })
      .catch(function (error) {
        console.error(
          'can not connect to ai-api to remove employee from ai vector database in case of change not open to work update',
        );
      });

    // send employee to ai model to added it in vector database
    // to be updated with employee profile changes for upcoming semantic search for jop matches, etc.
    axios
      .post(`${AI_API}/add_employee`, {
        data: {
          employee_id: user.profile_id,
          employee_profile: JSON.stringify({
            bio: employeeProfile.bio,
            city: employeeProfile.city,
            programming_languages: employeeProfile.programming_languages,
            experience_level: employeeProfile.experience_level,
          }),
        },
      })
      .then((response) => {
        console.log(
          `Employee: ${user.profile_id} added to ai model vector database while updating employee profile`,
        );
      })
      .catch(function (error) {
        console.error(
          'can not connect to ai-api to add employee in ai vector database while updating employee profile',
        );
      });
  }

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

// increment profile views by 1 with each view
exports.addProfileView = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const employeeProfile = await Employee.findByIdAndUpdate(
    user.profile_id,
    {
      $inc: { profile_views: 1 },
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      employeeProfile,
    },
  });
});

// employees names list, for general search in the application
exports.allEmployees = catchAsync(async (req, res, next) => {
  const employees = await Employee.find().select(
    '-user_id -contact_email -nationalID -city -bio -programming_languages -experience_level -open_to_work -createdAt -__v -profile_views',
  );

  res.status(200).json({
    status: 'success',
    length: employees.length,
    data: {
      employees,
    },
  });
});

// list matched jops for logged in employee based on ai-model semantic search
exports.matchedJops = catchAsync(async (req, res, next) => {
  const matched_jops = await JopMatch.find({
    employee_id: req.user.profile_id,
  }).populate('jop_id');

  res.status(200).json({
    status: 'success',
    length: matched_jops.length,
    data: {
      matched_jops,
    },
  });
});
