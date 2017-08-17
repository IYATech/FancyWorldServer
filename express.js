/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const global = require('./common/global');

//connect to mongodb
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://iyatest:iyatest2017@123.56.182.49:27017/test', {
  server: {
    reconnectTries: Number.MAX_VALUE,
    socketOptions: {connectTimeoutMS: 1000, socketTimeoutMS: 1000}
  }
});

// parse `application/x-www-form-urlencoded`
app.use(bodyParser.urlencoded({extended: true}));

// parse `application/json`
app.use(bodyParser.json());

//check user token
app.use(require('./service/user').checkToken);

//routes
app.use('/user', require('./routes/user'));
app.use('/event', require('./routes/event'));
app.use('/userMsg', require('./routes/userMsg'));
app.use('/chatMsg', require('./routes/chatMsg'));
app.use('/activity', require('./routes/activity'));
app.use('/activityTopic', require('./routes/activityTopic'));
app.use('/activitySignIn', require('./routes/activitySignIn'));
app.use('/activityNotice', require('./routes/activityNotice'));
app.use('/activityUploading', require('./routes/activityUploading'));
app.use('/activityElect', require('./routes/activityElect'));
app.use('/activityCourse', require('./routes/activityCourse'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
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
    error: err.status || 500,
    message: err.message
  });
});

module.exports = app;