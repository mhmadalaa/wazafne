const employerController = require('../controllers/employerController');
const authController = require('../controllers/authController');
const express = require('express');

const router = express.Router();

router.use(authController.isLogin);
router.use(authController.isEmployer);

router.patch('/update-profile', employerController.updateEmployerProfile);

router.get('/profile', employerController.employerProfile);

router.get('/filter-employees', employerController.searchForEmployees);

module.exports = router;
