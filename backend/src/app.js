const express = require('express');
const morgan = require('morgan');

const app = express();

// BACKGROUND TASKS
// require('./background_tasks/');

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
// app.use('/document', documentRouter);
// app.use('/book', bookRouter);

// NOT FOUND ROUTERS ERROR HANDLER
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message,
    },
  });
});

module.exports = app;
