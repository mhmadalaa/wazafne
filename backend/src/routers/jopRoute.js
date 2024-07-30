const jopController = require('../controllers/jopController');
const authController = require('../controllers/authController');
const express = require('express');

const router = express.Router();

router.use(authController.isLogin);

router
  .route('/create')
  .post(authController.isEmployer, jopController.createJop);

router
  .route('/edit/:id')
  .patch(authController.isEmployer, jopController.editJop);

// get, post, patch, put, delete

module.exports = router;
