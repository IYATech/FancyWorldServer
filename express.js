/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const global = require('./common/global');

// parse `application/x-www-form-urlencoded`
app.use(bodyParser.urlencoded({extended: true}));

// parse `application/json`
app.use(bodyParser.json());

//routes
app.use('/user', require('./routes/user'));
app.use('/event', require('./routes/event'));
app.use('/message', require('./routes/message'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // write the error info
  res.status(err.status || 500);
  res.json({
    'error': '404',
    'message': err.message
  });
});

//connect to mongodb
mongoose.connect('mongodb://123.56.182.49:27017/test');

module.exports = app;