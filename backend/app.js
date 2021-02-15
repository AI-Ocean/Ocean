const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://a05fb6559e15481e88528d4f32642757@sentry.io/5174189' });

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var history = require('connect-history-api-fallback');

var configs = require('./config/key');

// passport module
// require('./config/passport')(passport);
require("./config/passport")();

// db connect
mongoose
    .connect(configs.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected."))
    .catch(err => console.log(err));

var app = express();

// middleware
// app.use(history());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// router
app.get('/', (req, res) => {
  res.json({message: 'Ocean REST API Alive.'});
});
app.use('/api', require('./routes/auth'));
app.use('/api', 
  passport.authenticate('jwt', { session: false }), 
  require('./routes/api'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // send the error
  res.status(err.status || 500).json({message: err.message || 'ERROR'})
});

module.exports = app;
