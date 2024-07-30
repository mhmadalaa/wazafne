const employeeController = require('../controllers/employeeController');
const authController = require('../controllers/authController');
const express = require('express');

const router = express.Router();

router.use(authController.isLogin);
router.use(authController.isEmployee);

router
  .route('/profile')
  .get(employeeController.employeeProfile)
  .patch(employeeController.updateEmployeeProfile);

router.patch('/profile-view', employeeController.addProfileView);

router.get('/profiles-names', employeeController.allEmployees);

module.exports = router;
