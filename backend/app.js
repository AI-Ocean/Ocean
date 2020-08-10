const Sentry = require('@sentry/node')
Sentry.init({ dsn: 'https://a05fb6559e15481e88528d4f32642757@sentry.io/5174189' })

var configs = require('./configs')

var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var admin = require('firebase-admin')
var history = require('connect-history-api-fallback');

var app = express();
// config files
app.use('/config.js', (req, res) => {
  res.set('Content-type', 'text/javascript')
  res.send(`window.FIREBASE_CONFIG = ` + JSON.stringify(process.env.FIREBASE_CONFIG))
})

// firebase
admin.initializeApp({
  credential: admin.credential.cert(configs.FIREBASE_CERT)
})

// middleware
app.use(history())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(require('./middlewares/verifyToken'))

// router
app.use('/api', require('./routes/api'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // send the error
  res.status(err.status || 500).send(err.message || 'ERROR')
});

module.exports = app
