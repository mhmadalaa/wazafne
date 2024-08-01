const axios = require('axios');
const Employee = require('./../models/Employee');
const User = require('./../models/User');
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
  }

  // update the employee profile
  const employeeProfile = await Employee.findByIdAndUpdate(
    user.profile_id,
    update,
    {
      new: true,
      runValidators: true,
    },
  );

  // after updated the employee profile
  // update the ai-vector-database with the new profile data
  // to be updated in the semantic search operations

  if (employeeProfile.open_to_work === true && req.body.open_to_work === true) {
    // when user say he is open-to-work, that mean he is deleted from ai-vector-db.
    // so, we just need to add him.
    addToVectorDB(employeeProfile);
  } else if (
    employeeProfile.open_to_work === false &&
    req.body.open_to_work === false
  ) {
    // when user say he is not-open-to-work, we just need to delete him from vector-db.
    deleteFromVectorDB(employeeProfile);
  } else if (
    employeeProfile.open_to_work === true &&
    req.body.open_to_work === undefined
  ) {
    // when user is open-to-work, but he is not update the open-to-work status in this update,
    // that mean, he is open-to-work from a while, and his profile is saved in vector-db already.
    // so, to update his vector-embedding according the updated profile data,
    // we will delete the old embedding, and add the new data.
    deleteFromVectorDB(employeeProfile);
    addToVectorDB(employeeProfile);
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

const deleteFromVectorDB = (employee) => {
  axios
    .delete(`${AI_API}/delete_employee`, {
      data: {
        employee_id: employee._id,
      },
    })
    .then((response) => {
      console.log(`Employee: ${employee._id} deleted from ai vector database`);
    })
    .catch(function (error) {
      console.error(
        'can not connect to ai-api to remove employee from ai vector database',
      );
    });
};

const addToVectorDB = (employee) => {
  axios
    .post(`${AI_API}/add_employee`, {
      data: {
        employee_id: employee._id,
        employee_profile: JSON.stringify({
          bio: employee.bio,
          city: employee.city,
          programming_languages: employee.programming_languages,
          experience_level: employee.experience_level,
        }),
      },
    })
    .then((response) => {
      console.log(
        `Employee: ${employee._id} added to ai model vector database while updating employee profile`,
      );
    })
    .catch(function (error) {
      console.error(
        'can not connect to ai-api to add employee in ai vector database while updating employee profile',
      );
    });
};
