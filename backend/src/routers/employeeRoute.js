const employeeController = require('../controllers/employeeController');
const authController = require('../controllers/authController');
const express = require('express');

const router = express.Router();

router.use(authController.isLogin);
router.use(authController.isEmployee);

router.patch(
  '/update-profile',
  employeeController.updateEmployeeProfile,
);

router.get('/profile', employeeController.employeeProfile);

// get, post, patch, put, delete

module.exports = router;
