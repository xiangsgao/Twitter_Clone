// basic express and third party tools imports
const express = require('express');
const app = express();
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const env = require('dotenv').config({path: path.join(__dirname, '.env')});
const fetch = require('node-fetch');
const redis = require('redis');
const redis_client = redis.createClient(process.env.REDIS_PORT);
// flash and sessions imports
const flash = require('express-flash');
const session = require('express-session');
// passport imports for authentication
const initPassport = require('./passport_init');
const user_retrival = require('./user_retrival');
const redis_store = require('connect-redis')(session);

// basics mongoose import
const mongoose = require('mongoose');

// routers imports
const indexRouter = require('../routes/index');
const usersRouter = require('../routes/users');
const twitterRouter = require('../routes/twitter');
const mediaRouter = require('../routes/media');
const itemRouter = require('../routes/item');


const passport = require('passport');



// basic sessions setup for express
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new redis_store({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, client: redis_client, ttl: 86400 }) // saves the session id to redis, tll is session id expiration time
}));

// set up the passport for our back authentication
app.use(passport.initialize());
app.use(passport.session());
initPassport(passport, user_retrival.getUserByUserName, user_retrival.getUserById);


// mongodb setup
mongoose.connect(process.env.MONGO_DATABASE_URL, { useNewUrlParser: true });
const connection = mongoose.connection;
connection.on('connected', function() {
  console.log('Connected to db...');
});


// routes and view engine setup for express
app.set('views', path.join(process.env.FRONT_END_PATH, 'views'));
app.set('view engine', 'ejs');

if(process.env.USE_LOGGER === 'true') app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.env.FRONT_END_PATH, 'public')));

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', twitterRouter);
app.use('/', mediaRouter);
app.use('/', itemRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
