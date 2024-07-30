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

router
  .route('/created-jops')
  .get(authController.isEmployer, jopController.listCreatedJops);

router
  .route('/apply/:id')
  .post(authController.isEmployee, jopController.applyForJop);

router
  .route('/applicants/:id')
  .get(authController.isEmployer, jopController.listJopApplicants);

router
  .route('/accept-application')
  .patch(
    authController.isEmployer,
    jopController.enforceQueryParams,
    jopController.acceptApplication,
  );

router
  .route('/reject-application')
  .patch(
    authController.isEmployer,
    jopController.enforceQueryParams,
    jopController.rejectApplication,
  );

// get, post, patch, put, delete

module.exports = router;
