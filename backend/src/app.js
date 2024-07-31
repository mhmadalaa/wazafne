const express = require('express');
const morgan = require('morgan');

const authRouter = require('./routers/authRoute');
const employeeRouter = require('./routers/employeeRoute');
const employerRouter = require('./routers/employerRoute');
const jopRouter = require('./routers/jopRoute');

const app = express();

// BACKGROUND TASKS
require('./background_tasks/nonVerifiedUsers');
require('./background_tasks/employeesMatchedJops');

// to accept json data in requests
app.use(express.json());

// To log the state of the request
app.use(morgan('dev'));

// To parse the request url-encoded data to be in `req.body`
app.use(
  express.urlencoded({
    extended: false,
  }),
);

// APP ROUTERS
app.use('/auth', authRouter);
app.use('/employee', employeeRouter);
app.use('/employer', employerRouter);
app.use('/jop', jopRouter);

// NOT FOUND ROUTERS ERROR HANDLER
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message,
    },
  });
});

module.exports = app;
